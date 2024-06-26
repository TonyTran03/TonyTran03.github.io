/*
Auto-generated by: https://github.com/pmndrs/gltfjsx
Command: npx gltfjsx@6.2.18 public/models/crane.glb 
*/

import React, { useRef } from 'react'
import { useGLTF } from '@react-three/drei'
import { PointsMaterial } from 'three'

const material = new PointsMaterial({size: 0.005}, { color: 0x888888 })
export function Crane(props) {
  const { nodes, materials } = useGLTF('./models/crane.glb')
  return (
    <group {...props} dispose={null}>
      <mesh position={[0,0,0]} geometry={nodes.Crane.geometry} material={materials.OrigamiMat } scale={2} />

    </group>
  )
}

useGLTF.preload('./models/crane.glb')
