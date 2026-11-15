'use client'

import type { ReactNode } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'

export interface ShellSceneProps {
  children: ReactNode
  autoRotate?: boolean
}

export function ShellScene({ children, autoRotate = true }: ShellSceneProps) {
  return (
    <Canvas
      camera={{ position: [2.6, 1.6, 3.4], fov: 40, near: 0.01, far: 100 }}
      gl={{ antialias: true }}
      onCreated={({ gl }) => {
        gl.localClippingEnabled = true
      }}
    >
      <color attach="background" args={['#0c1418']} />
      <hemisphereLight args={['#dfeaf0', '#1a1410', 0.9]} />
      <directionalLight color="#fff1dc" intensity={2.2} position={[3, 5, 4]} />
      <directionalLight color="#7fb7c9" intensity={0.9} position={[-4, -1, -3]} />
      {children}
      <OrbitControls enableDamping autoRotate={autoRotate} autoRotateSpeed={0.8} />
    </Canvas>
  )
}
