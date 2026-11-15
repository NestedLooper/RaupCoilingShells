'use client'

import { useEffect, useMemo } from 'react'
import { Line } from '@react-three/drei'
import * as THREE from 'three'
import { FitCamera } from '@/components/three/FitCamera'
import { buildShell, type ShellParams } from '@/lib/raup'

export interface ShellProps {
  params: ShellParams
  /** Cut the shell in half through the coiling axis. */
  cut?: boolean
  wireframe?: boolean
}

export function Shell({ params, cut = false, wireframe = false }: ShellProps) {
  const { geometry, plane, axis, extent } = useMemo(() => {
    const mesh = buildShell(params)
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(mesh.positions, 3))
    g.setAttribute('color', new THREE.BufferAttribute(mesh.colors, 3))
    g.setIndex(new THREE.BufferAttribute(mesh.indices, 1))
    g.computeVertexNormals()
    return {
      geometry: g,
      plane: new THREE.Plane(new THREE.Vector3(0, 0, -1), mesh.axis.z),
      axis: mesh.axis,
      extent: mesh.extent,
    }
  }, [params])

  useEffect(() => () => geometry.dispose(), [geometry])

  return (
    <>
      <FitCamera radial={extent.radial} halfHeight={extent.halfHeight} />
      <mesh geometry={geometry}>
        <meshStandardMaterial
          key={cut ? 'cut' : 'whole'}
          vertexColors
          side={THREE.DoubleSide}
          roughness={0.55}
          metalness={0.05}
          wireframe={wireframe}
          clippingPlanes={cut ? [plane] : []}
        />
      </mesh>
      <Line
        points={[
          [axis.x, -1.6, axis.z],
          [axis.x, 1.6, axis.z],
        ]}
        color="#3d545d"
        lineWidth={1}
      />
    </>
  )
}
