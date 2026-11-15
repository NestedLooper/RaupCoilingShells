// Raup's four-parameter model of shell coiling (Raup 1966), as reviewed in
// Gerber 2017, "The geometry of morphospaces", Biol Rev 92(2):1142-1155.
//
// The generating curve is an ellipse whose outer margin sits at radius 1 at the aperture.
//   D = inner margin / outer margin  ->  half-width a = (1-D)/2, centre r0 = (1+D)/2
//   S = height / width               ->  half-height b = S*a
//   W = radial growth per revolution ->  scale s = W^(theta / 2pi)
//   T = axial shift of the centre per unit of radial shift

export interface ShellParams {
  /** Whorl expansion rate (> 1). */
  W: number
  /** Distance of the generating curve from the coiling axis (0 to 1). */
  D: number
  /** Translation rate along the coiling axis. */
  T: number
  /** Aperture shape: height divided by width. */
  S: number
  /** Number of revolutions drawn. */
  N: number
}

export const PRESETS: Record<string, ShellParams> = {
  Ammonoid: { W: 2.0, D: 0.35, T: 0, S: 1.0, N: 6 },
  Nautilus: { W: 3.2, D: 0.04, T: 0, S: 1.2, N: 3.5 },
  'Garden snail': { W: 1.9, D: 0.08, T: 1.3, S: 1.0, N: 6 },
  'Turret shell': { W: 1.25, D: 0.12, T: 4.2, S: 1.0, N: 11 },
  Bivalve: { W: 3000, D: 0.0, T: 0.4, S: 2.2, N: 1 },
  Brachiopod: { W: 20000, D: 0.0, T: 0, S: 2.6, N: 1 },
  'Open coil': { W: 1.6, D: 0.75, T: 0.6, S: 1.0, N: 6 },
}

export interface Arc {
  start: number
  end: number
}

const TWO_PI = 2 * Math.PI

/** Semi-axes and centre of the generating ellipse at the aperture. */
export function generatingEllipse({ D, S }: Pick<ShellParams, 'D' | 'S'>) {
  const a = (1 - D) / 2
  return { a, b: S * a, r0: (1 + D) / 2 }
}

/** With no translation, successive whorls overlap exactly when W * D < 1. */
export function whorlsOverlap({ W, D }: Pick<ShellParams, 'W' | 'D'>): boolean {
  return W * D < 1
}

/**
 * Is the point at angle `phi` on the generating curve inside one of the `prev` earlier whorls?
 * The model is self-similar, so the answer does not depend on where along the coil we are.
 */
export function insideEarlierWhorl(params: ShellParams, phi: number, prev: number): boolean {
  const { W, T } = params
  const { a, b, r0 } = generatingEllipse(params)
  if (a < 1e-6) return false
  const px = r0 + a * Math.cos(phi)
  const py = T * r0 + b * Math.sin(phi)
  for (let k = 1; k <= Math.min(prev, 60); k++) {
    const q = Math.pow(W, -k)
    if (q < 1e-5) break
    const dx = (px - r0 * q) / (a * q)
    const dy = (py - T * r0 * q) / (b * q)
    if (dx * dx + dy * dy < 1) return true
  }
  return false
}

/**
 * The part of the generating curve that is actually exposed. A real shell is not secreted inside
 * the whorl it wraps around, so the hidden part is cut away and the wall ends on the seam.
 */
export function keptArc(params: ShellParams, prev: number): Arc {
  const full: Arc = { start: 0, end: TWO_PI }
  if (prev < 1) return full
  const hidden = (phi: number) => insideEarlierWhorl(params, phi, prev)

  const M = 1440
  const step = TWO_PI / M
  const flags: boolean[] = []
  for (let i = 0; i < M; i++) flags.push(hidden(i * step))
  if (!flags.some(Boolean) || flags.every(Boolean)) return full

  // Longest run of exposed samples, walking the circle from a hidden sample.
  const i0 = flags.indexOf(true)
  let best = { len: 0, from: 0 }
  let run = 0
  let from = 0
  for (let j = 1; j <= M; j++) {
    if (!flags[(i0 + j) % M]) {
      if (run === 0) from = i0 + j
      run++
      if (run > best.len) best = { len: run, from }
    } else {
      run = 0
    }
  }

  // Refine both ends onto the exact seam.
  const bisect = (hiddenPhi: number, shownPhi: number) => {
    for (let n = 0; n < 30; n++) {
      const mid = (hiddenPhi + shownPhi) / 2
      if (hidden(mid)) hiddenPhi = mid
      else shownPhi = mid
    }
    return shownPhi
  }
  const first = best.from * step
  const last = (best.from + best.len - 1) * step
  return { start: bisect(first - step, first), end: bisect(last + step, last) }
}

export interface ShellMesh {
  positions: Float32Array
  colors: Float32Array
  indices: Uint32Array
  /** Where the coiling axis crosses the x-z plane after centring. */
  axis: { x: number; z: number }
  /** Room the shell needs as it spins about the vertical through the origin. */
  extent: { radial: number; halfHeight: number }
}

const srgbToLinear = (c: number) => (c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4))
const hex = (h: number) => [(h >> 16) & 255, (h >> 8) & 255, h & 255].map((v) => srgbToLinear(v / 255))
const CREAM = hex(0xf2e3c4)
const BROWN = hex(0xa8623a)

/** Longest side of the box every shell is scaled to fit. */
export const FIT_SIZE = 2.4

/** Build the shell surface as raw vertex data, centred and scaled to a common size. */
export function buildShell(params: ShellParams, segP = 56): ShellMesh {
  const { W, T, N } = params
  const { a, b, r0 } = generatingEllipse(params)
  const segT = Math.max(24, Math.round(N * 110))
  const positions = new Float32Array((segT + 1) * (segP + 1) * 3)
  const colors = new Float32Array(positions.length)
  const k = Math.log(W) / TWO_PI
  const arcs = new Map<number, Arc>()
  const min = [Infinity, Infinity, Infinity]
  const max = [-Infinity, -Infinity, -Infinity]

  let i = 0
  for (let t = 0; t <= segT; t++) {
    const theta = -N * TWO_PI * (1 - t / segT) // ends at the aperture, theta = 0
    const s = Math.exp(k * theta)
    const band = 0.5 + 0.5 * Math.sin(theta * 9)
    const cosT = Math.cos(theta)
    const sinT = Math.sin(theta)
    const prev = Math.floor((N * t) / segT + 1e-9) // whole whorls already built inside this one
    let arc = arcs.get(prev)
    if (!arc) {
      arc = keptArc(params, prev)
      arcs.set(prev, arc)
    }
    for (let p = 0; p <= segP; p++) {
      const phi = arc.start + (p / segP) * (arc.end - arc.start)
      const r = s * (r0 + a * Math.cos(phi))
      const xyz = [r * cosT, -s * (T * r0 + b * Math.sin(phi)), r * sinT] // apex up
      const rib = 0.5 + 0.5 * Math.cos(phi) // darker toward the outer keel
      const mix = 0.15 + 0.55 * band * (0.4 + 0.6 * rib)
      for (let c = 0; c < 3; c++) {
        positions[i + c] = xyz[c]
        colors[i + c] = CREAM[c] + (BROWN[c] - CREAM[c]) * mix
        if (xyz[c] < min[c]) min[c] = xyz[c]
        if (xyz[c] > max[c]) max[c] = xyz[c]
      }
      i += 3
    }
  }

  const indices = new Uint32Array(segT * segP * 6)
  let n = 0
  for (let t = 0; t < segT; t++) {
    for (let p = 0; p < segP; p++) {
      const A = t * (segP + 1) + p
      const B = A + segP + 1
      indices.set([A, B, A + 1, B, B + 1, A + 1], n)
      n += 6
    }
  }

  // Centre and scale so every shell fills the same view.
  const mid = min.map((lo, c) => (lo + max[c]) / 2)
  const scale = FIT_SIZE / Math.max(max[0] - min[0], max[1] - min[1], max[2] - min[2], 1e-6)
  let radial = 0
  for (let j = 0; j < positions.length; j += 3) {
    for (let c = 0; c < 3; c++) positions[j + c] = (positions[j + c] - mid[c]) * scale
    radial = Math.max(radial, Math.hypot(positions[j], positions[j + 2]))
  }

  return {
    positions,
    colors,
    indices,
    axis: { x: -mid[0] * scale, z: -mid[2] * scale },
    extent: { radial, halfHeight: ((max[1] - min[1]) * scale) / 2 },
  }
}
