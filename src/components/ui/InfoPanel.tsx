'use client'

import { useEffect, useState, type ReactNode } from 'react'

function Symbol({ children }: { children: ReactNode }) {
  return <i className="font-serif font-semibold text-[#e0a458]">{children}</i>
}

/** An info button for the top-left of the 3D view, with a panel explaining the model. */
export function InfoPanel() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <div className="pointer-events-none absolute left-3 top-3 z-10 flex max-h-[80dvh] w-[calc(100%-1.5rem)] md:max-h-[calc(100%-1.5rem)] max-w-md flex-col items-start gap-2">
      <button
        type="button"
        aria-label="About Raup's coiling model"
        aria-expanded={open}
        aria-controls="model-info"
        onClick={() => setOpen((v) => !v)}
        className={`pointer-events-auto flex h-9 w-9 shrink-0 items-center justify-center rounded-full border font-serif text-lg italic leading-none ${
          open
            ? 'border-[#e0a458] bg-[#e0a458] text-[#1a1408]'
            : 'border-[#26363d] bg-[#121d22] text-[#e6ded0] hover:border-[#e0a458]'
        }`}
      >
        i
      </button>

      {open && (
        <section
          id="model-info"
          aria-label="About Raup's coiling model"
          className="pointer-events-auto min-h-0 overflow-y-auto rounded-lg border border-[#26363d] bg-[#121d22]/95 p-4 text-[13px] leading-relaxed shadow-xl backdrop-blur"
        >
          <p>
            In 1966, paleontologist David Raup discovered that he could simulate the geometric shapes
            of nearly all coiled shells, horns, and tusks in nature by rotating a 2D shape (an
            aperture) along a logarithmic spiral with just three core parameters.
          </p>
          <p className="mt-3">
            The model is known as Raup&apos;s Coiling Model. The three key parameters are:
          </p>
          <ul className="mt-2 list-disc space-y-2 pl-5 marker:text-[#8fa0a3]">
            <li>
              <b>Whorl Expansion Rate</b> (<Symbol>W</Symbol>): How fast the tube gets wider and
              increases in size with each complete turn.
            </li>
            <li>
              <b>Distance from the Coiling Axis</b> (<Symbol>D</Symbol>): How far the generating
              tube sits away from the central axis (determining whether the coil is tight or has an
              open, wide loop).
            </li>
            <li>
              <b>Translation Rate</b> (<Symbol>T</Symbol>): How much the tube shifts or stretches
              vertically down along the coiling axis per revolution (which accounts for the
              difference between a flat, disc-like nautilus and a tall, pointy snail spire).
            </li>
          </ul>
          <aside className="mt-3 border-l-2 border-[#26363d] pl-3 text-[#8fa0a3]">
            An aside: this explorer has a fourth slider, <Symbol>S</Symbol>, for the shape of the
            aperture (its height divided by its width). Raup&apos;s model includes the shape of the
            generating curve as well, but it is usually held fixed, which is why the model is
            described by three core parameters.
          </aside>
          <p className="mt-3">
            By exploring these combinations in a theoretical{' '}
            <a
              href="https://demonstrations.wolfram.com/ShellParameterSpace/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#e0a458] underline underline-offset-2"
            >
              Shell Parameter Space
            </a>
            , Raup showed that while mathematically infinite shapes are possible, real-world
            biological organisms only occupy specific, functional regions of this morphospace.
          </p>
        </section>
      )}
    </div>
  )
}
