'use client'

import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'

export interface FitCameraProps {
  /** Farthest the shell reaches from the vertical through the origin. */
  radial: number
  /** Half of the shell's height. */
  halfHeight: number
}

const MARGIN = 1.1
/** Closest the camera comes: nearer on narrow screens, where the view is small. */
const minDistance = (width: number) => (width < 768 ? 2.7 : 3.6)

/** Frame the shell: move the camera in or out when the shell or the canvas changes shape. */
export function FitCamera({ radial, halfHeight }: FitCameraProps) {
  const camera = useThree((state) => state.camera)
  const width = useThree((state) => state.size.width)
  const height = useThree((state) => state.size.height)

  useEffect(() => {
    if (!('fov' in camera) || width === 0 || height === 0) return
    const tanV = Math.tan((camera.fov * Math.PI) / 360)
    const tanH = tanV * (width / height)
    // The camera looks slightly down, so a wide shell also takes up some height on screen.
    const forHeight = ((halfHeight + radial * 0.4) * MARGIN) / tanV
    const forWidth = (radial * MARGIN) / tanH
    camera.position.setLength(Math.max(forHeight, forWidth, minDistance(width)))
  }, [camera, width, height, radial, halfHeight])

  return null
}
