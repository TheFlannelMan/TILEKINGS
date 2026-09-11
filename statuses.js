/**
 * Tile Kings - Modular Status Effects Registry
 */
export const STATUS_DEFINITIONS = {
  stun: {
    id: 'stun',
    name: 'Stun',
    icon: '⚡',
    badgeColor: '#e74c3c',
    description: 'Unit cannot be activated during its player’s turn.',
    onBeforeActivate: (unit) => {
      return { allowActivation: false, message: `${unit.name} is Stunned and cannot activate!` };
    }
  },

  haste: {
    id: 'haste',
    name: 'Haste',
    icon: '💨',
    badgeColor: '#f1c40f',
    description: 'Unit gains +2 Movement distance.',
    modifyMoveSpeed: (baseSpeed) => baseSpeed + 2
  },

  quicken: {
    id: 'quicken',
    name: 'Quicken',
    icon: '🌀',
    badgeColor: '#3498db',
    description: 'Unit gains +1 Maneuver capacity this turn.',
    modifyManeuvers: (baseManeuvers) => baseManeuvers + 1
  },

  empower: {
    id: 'empower',
    name: 'Empower',
    icon: '🔥',
    badgeColor: '#e67e22',
    description: 'Unit gains +2 Attack Value on all attacks.',
    modifyAttackValue: (baseAttack) => baseAttack + 2
  },

  defended: {
    id: 'defended',
    name: 'Defended',
    icon: '🛡️',
    badgeColor: '#2ecc71',
    description: 'Unit gains +3 Defense Value.',
    modifyDefenseValue: (baseDefense) => baseDefense + 3
  },

  frenzy: {
    id: 'frenzy',
    name: 'Frenzy',
    icon: '⚔️',
    badgeColor: '#9b59b6',
    description: 'Unit may be activated a second time in the same turn.',
    allowSecondActivation: true
  },

  immobile: {
    id: 'immobile',
    name: 'Immobile',
    icon: '⛓️',
    badgeColor: '#7f8c8d',
    description: 'Unit cannot move (Movement = 0), but can still Maneuver and Attack.',
    modifyMoveSpeed: () => 0
  }
};
