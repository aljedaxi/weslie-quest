import { animated, config, useSpring } from '@react-spring/three'
import { useFrame, useThree } from '@react-three/fiber'
import { useBox, useKinematicCharacterController } from '@react-three/p2'
import { useEffect, useRef, useState } from 'react'
import type { Object3D } from 'three'
import type { LineSegments } from 'three'
import * as THREE from 'three'

import { useControls } from './use-controls'
import { PLAYER_GROUP, SCENERY_GROUP } from './App'

const useControlling = props => {
	const {body, collisions, camera, bodyApi, bodyPosition} = props

	const controls = useControls ()
	const [, controllerApi] = useKinematicCharacterController(() => ({
		body,
		collisionMask: SCENERY_GROUP,
		velocityXSmoothing: 0.0001,
	}))

	useFrame (() => {
		const {left, right} = controls.current
		controllerApi.setInput([~~right - ~~left, 0])
	})

	useEffect(() => {
		controllerApi.collisions.subscribe((e: { below: boolean }) => {
			collisions.current = e
		})

		bodyApi.position.subscribe((p) => {
			bodyPosition.current = p
			camera.position.lerp({ x: p[0], y: p[1], z: 100 } as THREE.Vector3, 0.1)
			camera.lookAt(p[0], p[1], 0)
		})
	}, [])
}

export const Player = props => {
	const body = useRef<Object3D> (null)
	const collisions = useRef<{below: boolean}> ({below: false})
	const {camera} = useThree ()
	const [, bodyApi] = useBox(
		() => ({
			mass: 0,
			position: props.position,
			fixedRotation: true,
			damping: 0,
			type: 'Kinematic',
			collisionGroup: PLAYER_GROUP,
		}),
		body,
	)
	const bodyPosition = useRef<[x: number, y: number]>()

	useControlling ({body, collisions, camera, bodyApi, bodyPosition})

	const yImpulse = 0
	const {scaleY, scaleX, positionY} = useSpring({
		from: {
		scaleY: yImpulse,
		scaleX: 1 + (1 - yImpulse) / 2,
		positionY: yImpulse > 1 ? (yImpulse - 1) / 1.5 : yImpulse - 1,
		},
		to: { scaleY: 1, scaleX: 1, positionY: 0 },
		config: config.wobbly,
		reset: true,
	})

	return (
		<group ref={body}>
			<animated.mesh scale-y={scaleY} scale-x={scaleX} position-y={positionY}>
				<boxBufferGeometry args={[1, 1]} />
				<meshNormalMaterial />
			</animated.mesh>
		</group>
	)
}
