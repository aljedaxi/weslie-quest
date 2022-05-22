import {createElement, Fragment} from 'react'
import {useMachine} from '@xstate/react'
import {createMachine} from 'xstate'

export const actionStates = {
  initial: 'topLevel',
  states: {
    topLevel: {
      on: {
        ATTACK: 'attacks',
        FLEE: 'fleeing',
      }
    },
    fleeing: {
      on: {
        SUCCESS: 'escape',
        FAILURE: 'topLevel',
      },
    },
    attacks: {
      on: {
        CANCEL: 'topLevel',
      },
    },
    escape: {
      type: 'final',
    }
  }
}

const actionMachine = createMachine ({id: 'battleActions', ...actionStates})

const comps = {
  attacks: function Attacks (props) {
    const {send, combatant} = props
    const {attacks} = combatant
    return (
      <Fragment>
        {attacks.map (({name, id}) => (
          <button key={name} onClick={() => send ('ATTACK', {combatant, id})}>
            {name}
          </button>
        ))}
        <button onClick={() => send ('CANCEL')}>go back</button>
      </Fragment>
    )
  },
  topLevel: function TopLevel ({send, state}) {
    return (
      <Fragment>
        <button onClick={() => send ('ATTACK')}>attack</button>
        <button onClick={() => send ('FLEE')}>flee</button>
      </Fragment>
    )
  },
}

export const ActionBox = props => {
  const {style, combatant, state, send, children} = props
  const value = state.value.choosing
  const comp = comps[value]
  return (
    <div style={{
      ...style,
      display: 'grid',
      placeItems: 'center',
      gridTemplateColumns: '1fr 1fr',
      gridTemplateRows: '1fr 1fr',
      outline: '1px solid black',
      padding: 8,
      width: 'calc(100% - 16px - 2px)',
      height: 'calc(100% - 16px - 2px)',
    }}>
      {comp ? createElement (comp, {send, state, combatant}, null) : children}
    </div>
  )
}
