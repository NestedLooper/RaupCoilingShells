import {
  FIT_SIZE,
  PRESETS,
  buildShell,
  generatingEllipse,
  insideEarlierWhorl,
  keptArc,
  whorlsOverlap,
  type ShellParams,
} from '@/lib/raup'

const TWO_PI = 2 * Math.PI
const ammonoid = PRESETS.Ammonoid

describe('whorlsOverlap', () => {
  it('follows the W * D < 1 rule', () => {
    expect(whorlsOverlap({ W: 2, D: 0.35 })).toBe(true)
    expect(whorlsOverlap({ W: 2, D: 0.6 })).toBe(false)
  })
})

describe('keptArc', () => {
  it('keeps the whole curve when there is no earlier whorl', () => {
    expect(keptArc(ammonoid, 0)).toEqual({ start: 0, end: TWO_PI })
  })

  it('keeps the whole curve when whorls do not touch', () => {
    const open: ShellParams = { W: 2, D: 0.6, T: 0, S: 1, N: 6 }
    expect(keptArc(open, 5)).toEqual({ start: 0, end: TWO_PI })
  })

  it('cuts away the part hidden inside the previous whorl', () => {
    const arc = keptArc(ammonoid, 5)
    expect(arc.end - arc.start).toBeLessThan(TWO_PI)
    expect(arc.end - arc.start).toBeGreaterThan(Math.PI)
    // The inner margin (phi = pi) is the hidden part, so it lies outside the kept arc.
    expect(insideEarlierWhorl(ammonoid, Math.PI, 5)).toBe(true)
    const mid = (arc.start + arc.end) / 2
    expect(insideEarlierWhorl(ammonoid, mid, 5)).toBe(false)
  })

  it('ends exactly on the surface of the previous whorl', () => {
    const { a, b, r0 } = generatingEllipse(ammonoid)
    const q = 1 / ammonoid.W
    for (const phi of Object.values(keptArc(ammonoid, 1))) {
      const dx = (r0 + a * Math.cos(phi) - r0 * q) / (a * q)
      const dy = (b * Math.sin(phi)) / (b * q)
      expect(dx * dx + dy * dy).toBeCloseTo(1, 4)
    }
  })
})

describe('buildShell', () => {
  it.each(Object.entries(PRESETS))('%s fits the common box with finite vertices', (_name, params) => {
    const mesh = buildShell(params)
    let lo = Infinity
    let hi = -Infinity
    let finite = true
    for (const v of mesh.positions) {
      finite = finite && Number.isFinite(v)
      lo = Math.min(lo, v)
      hi = Math.max(hi, v)
    }
    expect(finite).toBe(true)
    expect(hi - lo).toBeLessThanOrEqual(FIT_SIZE + 1e-4)
    const maxIndex = mesh.indices.reduce((m, v) => Math.max(m, v), 0)
    expect(maxIndex).toBeLessThan(mesh.positions.length / 3)
  })

  it('never places a vertex inside the previous whorl', () => {
    const segP = 24
    const mesh = buildShell(ammonoid, segP)
    const { a, b, r0 } = generatingEllipse(ammonoid)
    const rows = mesh.positions.length / 3 / (segP + 1)
    // Undo the fit scaling: at the aperture the outer margin sits at radius 1.
    let unit = 0
    for (let j = 0; j < mesh.positions.length; j += 3) {
      unit = Math.max(unit, Math.hypot(mesh.positions[j] - mesh.axis.x, mesh.positions[j + 2] - mesh.axis.z))
    }
    const row = rows - 1 // the aperture, where s = 1
    for (let p = 0; p <= segP; p++) {
      const j = (row * (segP + 1) + p) * 3
      const r = Math.hypot(mesh.positions[j] - mesh.axis.x, mesh.positions[j + 2] - mesh.axis.z) / unit
      const y = mesh.positions[j + 1] / unit
      const q = 1 / ammonoid.W
      const dx = (r - r0 * q) / (a * q)
      const dy = y / (b * q)
      expect(dx * dx + dy * dy).toBeGreaterThanOrEqual(1 - 1e-3)
    }
  })
})
