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
    <Canvas orthographic camera={{position: [0, 0, 0], zoom: 50}}>
      <MeshBox args={[10, 30, 3]} position={[2, 3, -5]}/>
      <Physics normalIndex={1}>
        <Player position={[-1, 14]}/>
        <Box args={[3, 3]} position={[-3, 9]} />
      </Physics>
    </Canvas>
  );
}

export default App;
