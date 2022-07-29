import { animated, config, useSpring } from '@react-spring/three'
import { useFrame, useThree } from '@react-three/fiber'
import { useBox, useTopDownVehicle } from '@react-three/p2'
import { useEffect, useRef, useState } from 'react'
import {vec2} from 'p2-es'
import type { Object3D } from 'three'
import type { LineSegments } from 'three'
import * as THREE from 'three'

import { useControls } from './use-controls'
import { PLAYER_GROUP, SCENERY_GROUP } from './App'

export const Player = props => {
	const {maxBrake = 50, steer = Math.PI / 8, force = 10} = props

	const controls = useControls()

	const { camera } = useThree()

	const chassisBody = useRef<Object3D>(null)

	const frontWheels = {localPosition: vec2.fromValues(0, 0.96), sideFriction: 10}
	const backWheels = {localPosition: vec2.fromValues(0, -0.66), sideFriction: 12}

	const [, chassisApi] = useBox(() => ({args: [1.3, 3.2], mass: 1}), chassisBody)

	const positionHelper = useRef<[number, number]>([0, 0])

	const velocity = useRef<[number, number]>([0, 0])

	const targetHelper = useRef(new THREE.Vector3())

	const angle = useRef(0)

	const [angularVelocity, setAngularVelocity] = useState(0)

	useEffect(() => {
		chassisApi.angle.subscribe((a) => (angle.current = a))
		chassisApi.velocity.subscribe((v) => (velocity.current = v))
		chassisApi.angularVelocity.subscribe(setAngularVelocity)

		chassisApi.position.subscribe((p) => {
		vec2.rotate(positionHelper.current, [0, 10], angle.current)

		vec2.add(positionHelper.current, p, positionHelper.current)

		// camera.position.lerp(
		// { x: positionHelper.current[0], y: 10, z: positionHelper.current[1] } as THREE.Vector3,
		// 0.025,
		// )

		targetHelper.current.lerp({ x: p[0], y: 0.5, z: p[1] } as THREE.Vector3, 0.075)

		camera.lookAt(targetHelper.current)
		})
	}, [])

	const [vehicle, vehicleApi] = useTopDownVehicle(() => ({
		chassisBody,
		wheels: [frontWheels, backWheels],
	}))

	useFrame(() => {
		const { forward, backward, left, right, brake } = controls.current

		const _steeringValue = left || right ? steer * (left && !right ? -1 : 1) : 0

		vehicleApi.applyEngineForce(forward || backward ? force * (forward && !backward ? -1 : 1) : 0, 1)

		vehicleApi.setSteeringValue(_steeringValue, 1)

		vehicleApi.setBrake(brake ? maxBrake : 0, 1)
	})

	const texture = new THREE.TextureLoader().load ('/wes-stanced.png')
	return (
		<group ref={vehicle}>
			<group ref={chassisBody}>
      	<mesh>
      	  <planeGeometry position={[0,0,0]} args={[15, 15, 15]} />
      	  <meshBasicMaterial transparent map={texture} />
      	</mesh>
      </group>
		</group>
	)
}
