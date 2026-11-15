'use client'

import { useEffect, useRef, type PointerEvent } from 'react'
import { PRESETS, type ShellParams } from '@/lib/raup'

/** W runs from 1 to 100,000 on a log axis. */
const LOG_W_MAX = 5
const PAD = { left: 30, right: 8, top: 8, bottom: 22 }
const SUPERSCRIPT = '⁰¹²³⁴⁵'

export interface MorphospaceMapProps {
  params: ShellParams
  onPick: (D: number, W: number) => void
}

function draw(canvas: HTMLCanvasElement, params: ShellParams) {
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  const w = canvas.clientWidth
  const h = canvas.clientHeight
  if (canvas.width !== Math.round(w * dpr)) {
    canvas.width = Math.round(w * dpr)
    canvas.height = Math.round(h * dpr)
  }
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  const pw = w - PAD.left - PAD.right
  const ph = h - PAD.top - PAD.bottom
  const X = (D: number) => PAD.left + D * pw
  const Y = (logW: number) => PAD.top + ph - (logW / LOG_W_MAX) * ph
  const curve = (D: number) => Y(Math.min(LOG_W_MAX, -Math.log10(D)))

  ctx.clearRect(0, 0, w, h)
  ctx.fillStyle = '#0f191d'
  ctx.fillRect(PAD.left, PAD.top, pw, ph)

  // Region under the W = 1/D curve, where successive whorls overlap.
  ctx.save()
  ctx.beginPath()
  ctx.rect(PAD.left, PAD.top, pw, ph)
  ctx.clip()
  ctx.beginPath()
  ctx.moveTo(X(0), Y(LOG_W_MAX))
  for (let D = 0.00001; D <= 1; D += 0.004) ctx.lineTo(X(D), curve(D))
  ctx.lineTo(X(1), Y(0))
  ctx.lineTo(X(0), Y(0))
  ctx.closePath()
  ctx.fillStyle = '#e0a45822'
  ctx.fill()
  ctx.beginPath()
  ctx.moveTo(X(0.00001), curve(0.00001))
  for (let D = 0.004; D <= 1; D += 0.004) ctx.lineTo(X(D), curve(D))
  ctx.strokeStyle = '#e0a458'
  ctx.lineWidth = 1.5
  ctx.stroke()
  ctx.restore()

  // Axes.
  ctx.font = '10px ui-sans-serif, system-ui, sans-serif'
  ctx.textAlign = 'right'
  ctx.textBaseline = 'middle'
  for (let e = 0; e <= LOG_W_MAX; e++) {
    ctx.fillStyle = '#8fa0a3'
    ctx.fillText(e === 0 ? '1' : `10${SUPERSCRIPT[e]}`, PAD.left - 4, Y(e))
    ctx.strokeStyle = '#1e2c32'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(PAD.left, Y(e))
    ctx.lineTo(PAD.left + pw, Y(e))
    ctx.stroke()
  }
  ctx.fillStyle = '#8fa0a3'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'top'
  for (const D of [0, 0.25, 0.5, 0.75, 1]) ctx.fillText(String(D), X(D), PAD.top + ph + 4)
  ctx.fillText('D', X(0.375), PAD.top + ph + 4)
  ctx.save()
  ctx.translate(8, PAD.top + ph / 2)
  ctx.rotate(-Math.PI / 2)
  ctx.textBaseline = 'middle'
  ctx.fillText('W', 0, 0)
  ctx.restore()

  // Preset markers, then the current shell.
  for (const preset of Object.values(PRESETS)) {
    ctx.beginPath()
    ctx.arc(X(preset.D), Y(Math.log10(preset.W)), 2.5, 0, 2 * Math.PI)
    ctx.fillStyle = '#5d7a84'
    ctx.fill()
  }
  ctx.beginPath()
  ctx.arc(X(params.D), Y(Math.log10(params.W)), 5.5, 0, 2 * Math.PI)
  ctx.fillStyle = '#fff3dc'
  ctx.fill()
  ctx.strokeStyle = '#0c1418'
  ctx.lineWidth = 2
  ctx.stroke()
}

export function MorphospaceMap({ params, onPick }: MorphospaceMapProps) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    draw(canvas, params)
    const observer = new ResizeObserver(() => draw(canvas, params))
    observer.observe(canvas)
    return () => observer.disconnect()
  }, [params])

  const pick = (e: PointerEvent<HTMLCanvasElement>) => {
    const canvas = e.currentTarget
    const box = canvas.getBoundingClientRect()
    const pw = box.width - PAD.left - PAD.right
    const ph = box.height - PAD.top - PAD.bottom
    const D = Math.min(0.95, Math.max(0, (e.clientX - box.left - PAD.left) / pw))
    const logW = Math.min(LOG_W_MAX, Math.max(0.02, (1 - (e.clientY - box.top - PAD.top) / ph) * LOG_W_MAX))
    onPick(D, Math.pow(10, logW))
  }

  return (
    <canvas
      ref={ref}
      aria-label="Morphospace map of whorl expansion rate against distance from the coiling axis"
      className="block aspect-[5/4] w-full cursor-crosshair touch-none rounded-md border border-[#26363d]"
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture(e.pointerId)
        pick(e)
      }}
      onPointerMove={(e) => {
        if (e.buttons) pick(e)
      }}
    />
  )
}
