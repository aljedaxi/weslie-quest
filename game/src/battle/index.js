import {createElement, useEffect, Fragment} from 'react'
import {useMachine} from '@xstate/react'
import {createMachine, assign} from 'xstate'
import {ActionBox, actionStates} from './actions'

const attacks = {
  scratch: {
    name: 'scratch',
    id: 'scratch',
    damage: 3,
  },
  crankThat: {
    name: 'crank that soulja boy',
    id: 'crankThat',
    damage: 5,
  }
}

const wessie = {
  id: 'wessie',
  name: 'weslie',
  hp: 9001,
  src: '/wessie.test.jpg',
  attacks: [attacks.scratch, attacks.crankThat]
}

const tacticalChungus = {
  id: 'tacticalChungus',
  name: 'tactical chungus',
  hp: 5,
  src: '/tactical.chungus.jpg',
  attacks: [attacks.crankThat]
}

const natural = n => n < 0 ? 0 : Math.floor (n)
const reduceBy = c => n => ({...c, hp: natural (c.hp - n)})
const trace = s => {console.log(s); return s;};

const selectAction = {selection: ({selection}, {type, ...e}) => ({...selection, [type]: e})}
const attack = assign ({
  combatants: ({combatants, selection}, {id: targetId}) => ({
    ...combatants,
    [targetId]: reduceBy (combatants[targetId]) (attacks[selection.ATTACK.id].damage)
  }),
  ...selectAction,
})
const select = assign (selectAction)
const isDead = c => c.hp < 1
const noEnemyDeaths = ({enemyTeam, combatants}) =>
  enemyTeam.combatants.every (id => isDead (combatants[id]))

const noWessieDeaths = ({combatants}) => isDead (combatants.wessie)
const youAttacked = ({enemyTeam, selection}) =>
  enemyTeam.combatants.some (id => id === selection.TARGET.id)
const enemyAttacked = ({myTeam, selection}) =>
  myTeam.combatants.some (id => id === selection.TARGET.id)


const battleMachine = createMachine ({
  id: 'battleState',
  initial: 'choosing',
  states: {
    choosing: {
      on: {
        ATTACK: {target: 'targeting', actions: 'select'},
      },
      ...actionStates,
    },
    targeting: {
      on: {
        TARGET: {target: 'attacking', actions: 'attack'},
        CANCEL: 'choosing.attacks',
      },
    },
    attacking: {
      after: {1000: {target: 'postAttack'}},
    },
    postAttack: {
      always: [
        {target: 'victory', cond: 'noEnemyDeaths'},
        {target: 'failure', cond: 'noWessieDeaths'},
        {target: 'enemyTurn', cond: 'youAttacked'},
        {target: 'choosing', cond: 'enemyAttacked'},
      ],
    },
    enemyTurn: {
      initial: 'choosing',
      on: {
        TARGET: {target: 'attacking', actions: 'attack'}
      },
      states: {
        choosing: {
          on: {
            ATTACK: {target: 'targeting', actions: 'select'},
          },
        },
        targeting: {},
      },
    },
    victory: {type: 'final'},
    failure: {type: 'final'},
  }
}, {
  guards: {noEnemyDeaths, noWessieDeaths, youAttacked, enemyAttacked},
  actions: {attack, select},
})

const ri = xs => xs[Math.floor (Math.random () * (xs.length))]

const Battle = props => {
  const [state, send] = useMachine (battleMachine, {
    context: {
      myTeam: {name: '', combatants: [wessie.id]},
      enemyTeam: {name: 'tactical chungus', combatants: [tacticalChungus.id]},
      combatants: {tacticalChungus, wessie},
    },
  })

  const {value, context} = state
  const {enemyTeam, myTeam, combatants, selection} = context
  console.log('selection', selection);

  useEffect (() => {
    const {enemyTurn} = value
    if (!enemyTurn) return
    const combatant = combatants[enemyTeam.combatants[0]]
    if (enemyTurn === 'targeting') send ('TARGET', {id: ri (myTeam.combatants)})
    if (enemyTurn === 'choosing') send ('ATTACK', {combatant, id: ri (combatant.attacks).id})
  }, [value.enemyTurn])

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gridTemplateRows: '2fr 1fr',
      padding: 8,
      width: 'calc(100% - 16px)',
      height: 'calc(100% - 16px)',
      placeItems: 'center',
    }}>
      <div>
        {enemyTeam.combatants.map (id => combatants[id]).map (({name, id, hp, src}) => (
          <div role='button' onClick={_ => send ('TARGET', {id})} key={id}>
            <h2>{name} — {hp}hp</h2>
            <img style={{width: '260px'}} src={src} alt="" />
          </div>
        ))}
      </div>
      <div>
        {myTeam.combatants.map (id => combatants[id]).map (({name, hp, src}) => (
          <Fragment key={name}>
            <h2>{name} — {hp}hp</h2>
            <img style={{width: '260px'}} src={src} alt="" />
          </Fragment>
        ))}
      </div>
      <ActionBox
        style={{gridColumn: 'span 2'}}
        combatant={combatants[myTeam.combatants[0]]}
        {...{state, send}}
      >
        {value.enemyTurn ? 'enemy is choosing' : null}
        {value === 'targeting' ? 'choose a target or TODO cancel' : null}
        {value === 'victory' ? 'you win!' : null}
        {value === 'failure' ? 'you loose! ~.~' : null}
        {value === 'attacking' 
          ? `${selection.ATTACK.combatant.name} used ${attacks[selection.ATTACK.id].name}`
          : null}
      </ActionBox>
    </div>
  )
}
export default Battle
