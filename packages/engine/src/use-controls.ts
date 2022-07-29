import { useEffect, useRef } from 'react'

const keyControlMap = {
	' ': 'brake',
	ArrowDown: 'backward',
	ArrowLeft: 'left',
	ArrowRight: 'right',
	ArrowUp: 'forward',
	w: 'forward',
	a: 'left',
	s: 'backward',
	d: 'right',
} as const

const defaultMap = Object.fromEntries (
	Object.entries (keyControlMap).map (
		([k, v]) => [v, false]
	)
)

type KeyCode = keyof typeof keyControlMap
type GameControl = typeof keyControlMap[KeyCode]
type PressedMap = Record<GameControl, boolean>

const keyCodes = Object.keys(keyControlMap) as KeyCode[]
const isKeyCode = (v: unknown): v is KeyCode => keyCodes.includes(v as KeyCode)

export function useControls() {
	const controls = useRef<PressedMap>(defaultMap)
	const {current} = controls
	useEffect(() => {
		const handleKeydown = ({ key }: KeyboardEvent) => {
			if (!isKeyCode(key)) return
			current[keyControlMap[key]] = true
		}
		const handleKeyup = ({ key }: KeyboardEvent) => {
			if (!isKeyCode(key)) return
			current[keyControlMap[key]] = false
		}
		window.addEventListener('keydown', handleKeydown)
		window.addEventListener('keyup', handleKeyup)
		return () => {
			window.removeEventListener('keydown', handleKeydown)
			window.removeEventListener('keyup', handleKeyup)
		}
	}, [current])
	return controls
}

