import {Fragment} from 'react'

import {Canvas} from '@react-three/fiber'
import {Physics, useBox} from '@react-three/p2'
import {Player} from './engine'

export const SCENERY_GROUP = Math.pow (2, 1)
export const PLAYER_GROUP = Math.pow (2, 2)

const MeshBox = props => {
  const {color = 0x284761, args, angle, position} = props
  return (
    <mesh position={position} rotation-x={angle}>
      <boxGeometry args={args}/>
      <meshBasicMaterial color={color}/>
    </mesh>
  )
}

const Box = props => {
  const {args, position, angle} = props
  const [ref] = useBox (() => ({
    args,
    position,
    angle,
    mass: 0,
    collisionGroup: SCENERY_GROUP,
  }))
  return (
    <mesh ref={ref}>
      <boxGeometry args={[...args, 3]}/>
      <meshBasicMaterial/>
    </mesh>
  )
}

const App = () => {
  return (
    <Canvas shadows camera={{ position: [10, 20, 10], fov: 50 }}>
      <color attach="background" args={['#171720']} />
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[100, 100]} />
        <meshBasicMaterial color={0x70798b} />
      </mesh>
      <Physics gravity={[0, 0]} normalIndex={1}>
        <Player />
      </Physics>
    </Canvas>
  );
}

export default App;
