'use client'

import { useState } from 'react'
import { Shell } from '@/components/three/Shell'
import { ShellScene } from '@/components/three/ShellScene'
import { InfoPanel } from '@/components/ui/InfoPanel'
import { MorphospaceMap } from '@/components/ui/MorphospaceMap'
import { PRESETS, whorlsOverlap, type ShellParams } from '@/lib/raup'

const KEYS = ['W', 'D', 'T', 'S', 'N'] as const

const formatW = (W: number) =>
  W >= 1000 ? Math.round(W).toLocaleString('en-US') : W >= 10 ? W.toFixed(1) : W.toFixed(2)

interface SliderProps {
  symbol: string
  label: string
  value: number
  display: string
  min: number
  max: number
  step: number
  onChange: (value: number) => void
}

function Slider({ symbol, label, value, display, min, max, step, onChange }: SliderProps) {
  return (
    <label className="mb-2.5 block">
      <span className="flex items-baseline justify-between gap-2">
        <b className="font-semibold">{symbol}</b>
        <span className="text-xs text-[#8fa0a3]">{label}</span>
        <output className="tabular-nums text-[#e0a458]">{display}</output>
      </span>
      <input
        type="range"
        className="mt-1 w-full"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </label>
  )
}

function Toggle({ on, onClick, children }: { on: boolean; onClick: () => void; children: string }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onClick}
      className={`rounded-md border px-2.5 py-1 text-[12.5px] ${
        on
          ? 'border-[#e0a458] bg-[#e0a458] text-[#1a1408]'
          : 'border-[#26363d] bg-[#1b2a30] hover:border-[#e0a458]'
      }`}
    >
      {children}
    </button>
  )
}

const heading = 'mb-2 mt-5 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#8fa0a3]'

export function ShellExplorer() {
  const [params, setParams] = useState<ShellParams>(PRESETS.Ammonoid)
  const [cut, setCut] = useState(false)
  const [wireframe, setWireframe] = useState(false)
  const [spin, setSpin] = useState(true)

  const set = (patch: Partial<ShellParams>) => setParams((p) => ({ ...p, ...patch }))
  const overlap = whorlsOverlap(params)

  return (
    <div className="flex min-h-0 flex-1 flex-col-reverse md:flex-row">
      <aside className="max-h-[50vh] overflow-y-auto border-t border-[#26363d] bg-[#121d22] p-4 text-sm md:max-h-none md:w-80 md:shrink-0 md:border-r md:border-t-0">
        <h1 className="font-serif text-xl font-semibold">Raup coiling shells</h1>
        <p className="mb-3.5 mt-1 text-[12.5px] text-[#8fa0a3]">
          Raup&apos;s four-parameter model of coiled shells. Drag to orbit, scroll to zoom.
        </p>

        <div className="flex flex-wrap gap-1.5">
          {Object.entries(PRESETS).map(([name, preset]) => (
            <Toggle
              key={name}
              on={KEYS.every((k) => Math.abs(preset[k] - params[k]) < 1e-9)}
              onClick={() => setParams(preset)}
            >
              {name}
            </Toggle>
          ))}
        </div>

        <h2 className={heading}>Parameters</h2>
        <Slider
          symbol="W"
          label="whorl expansion rate"
          value={Math.log10(params.W)}
          display={formatW(params.W)}
          min={0.02}
          max={5}
          step={0.01}
          onChange={(v) => set({ W: Math.pow(10, v) })}
        />
        <Slider
          symbol="D"
          label="distance from coiling axis"
          value={params.D}
          display={params.D.toFixed(2)}
          min={0}
          max={0.95}
          step={0.005}
          onChange={(D) => set({ D })}
        />
        <Slider
          symbol="T"
          label="translation along axis"
          value={params.T}
          display={params.T.toFixed(2)}
          min={0}
          max={5}
          step={0.01}
          onChange={(T) => set({ T })}
        />
        <Slider
          symbol="S"
          label="aperture shape (height ÷ width)"
          value={params.S}
          display={params.S.toFixed(2)}
          min={0.3}
          max={3}
          step={0.01}
          onChange={(S) => set({ S })}
        />
        <Slider
          symbol="Whorls"
          label="revolutions drawn"
          value={params.N}
          display={params.N.toFixed(2)}
          min={0.5}
          max={12}
          step={0.25}
          onChange={(N) => set({ N })}
        />

        <h2 className={heading}>Morphospace (W against D)</h2>
        <MorphospaceMap params={params} onPick={(D, W) => set({ D, W })} />
        <p className="mt-1.5 text-[12.5px]">
          W × D = <b className="text-[#e0a458]">{(params.W * params.D).toFixed(2)}</b>: whorls{' '}
          <b className="text-[#e0a458]">{overlap ? 'overlap' : 'do not touch'}</b>
          {params.T > 0 && ' (criterion is exact only at T = 0)'}
        </p>
        <p className="mt-1.5 text-xs text-[#8fa0a3]">
          Click or drag in the map to move through the morphospace. The curve is W = 1/D: below it
          successive whorls overlap, above it they separate. Most ammonoids sit below the curve.
        </p>

        <h2 className={heading}>View</h2>
        <div className="flex flex-wrap gap-1.5">
          <Toggle on={cut} onClick={() => setCut((v) => !v)}>
            Cross-section
          </Toggle>
          <Toggle on={wireframe} onClick={() => setWireframe((v) => !v)}>
            Wireframe
          </Toggle>
          <Toggle on={spin} onClick={() => setSpin((v) => !v)}>
            Auto-rotate
          </Toggle>
        </div>
      </aside>

      <div className="relative min-h-[45vh] flex-1">
        <InfoPanel />
        <ShellScene autoRotate={spin}>
          <Shell params={params} cut={cut} wireframe={wireframe} />
        </ShellScene>
      </div>
    </div>
  )
}
