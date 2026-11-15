# Raup Coiling Shells

A Next.js app that renders coiled shells in 3D from Raup's four-parameter coiling model, and lets you move through the morphospace of possible shell shapes. It follows the model as reviewed in Gerber 2017, [The geometry of morphospaces: lessons from the classic Raup shell coiling model](https://pubmed.ncbi.nlm.nih.gov/27151556/).

## Features

- **3D shell** generated live from four parameters, with presets for an ammonoid, nautilus, garden snail, turret shell, bivalve, brachiopod and an open coil
- **Morphospace map** of W against D with the W = 1/D curve; click or drag to change the shell
- **Whorls that wrap, not intersect**: each whorl is trimmed where it meets the one it coils around, so the wall ends on the seam as in a real shell
- **Cross-section, wireframe and auto-rotate** view toggles

### Parameters

| Parameter | Meaning |
|---|---|
| W | Whorl expansion rate: how much the shell grows per revolution |
| D | Distance of the generating curve from the coiling axis |
| T | Translation along the coiling axis per revolution |
| S | Aperture shape: height divided by width |

With no translation (T = 0), successive whorls overlap exactly when W × D < 1.

## Running locally

**Prerequisites:** Node.js 18+

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

No API keys or environment variables are required.

## Other commands

```bash
npm run build   # production build + type check
npm test        # Jest test suite
npm run lint    # ESLint
```

## Layout

| Path | Contents |
|---|---|
| `src/lib/raup.ts` | The coiling model: pure geometry, no rendering |
| `src/components/three/` | The shell mesh and the 3D scene |
| `src/components/ui/` | Controls and the morphospace map |

## Not included

Gerber's paper argues that Raup's morphospace is not Euclidean and proposes a landmark-based morphospace for quantitative comparison. That alternative space is not implemented here.

## Stack

- **Next.js 16** (App Router)
- **react-three-fiber** + **@react-three/drei**: Three.js in React
- **Tailwind CSS**, **TypeScript**, **Jest**
