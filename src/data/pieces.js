/**
 * Tile Kings - Piece Catalog Data
 * All piece stats, costs, activation rules, facing rules, and attack profiles.
 * Point costs default to floor(maxHP / 2).
 */
export const DEFAULT_PIECES = {
  pawn: {
    id: 'pawn',
    name: 'Pawn',
    symbol: '♟',
    pointCost: 1,
    maxHP: 2,
    defense: 1,
    movement: {
      type: 'straight_front',
      maxDistance: 1,
      maneuversPerActivation: 1,
      passthroughFriendly: false,
      passthroughEnemy: false
    },
    activationSequence: ['MOVE_THEN_ATTACK', 'ATTACK_THEN_MOVE', 'MOVE_OR_ATTACK'],
    libraryCapacity: 0,
    manaStorageCapacity: 0,
    attackProfiles: [
      {
        id: 'pawn_thrust',
        name: 'Thrust',
        pattern: 'front_line',
        range: 1,
        attackValue: 3,
        manaCost: { fire: 0, earth: 0, water: 0, air: 0 },
        captureMovement: true, // Attacker advances into space on capture
        knockback: 0
      }
    ],
    abilities: [
      {
        id: 'infantry_wall',
        name: 'Infantry Wall',
        description: 'Gains +1 Defense when orthogonally adjacent to another friendly Pawn.'
      }
    ]
  },

  bishop: {
    id: 'bishop',
    name: 'Bishop',
    symbol: '♝',
    pointCost: 2,
    maxHP: 4,
    defense: 1,
    movement: {
      type: 'diagonal',
      maxDistance: 3,
      maneuversPerActivation: 1,
      passthroughFriendly: false,
      passthroughEnemy: false
    },
    activationSequence: ['MOVE_THEN_ATTACK', 'ATTACK_THEN_MOVE'],
    libraryCapacity: 0,
    manaStorageCapacity: 0,
    attackProfiles: [
      {
        id: 'bishop_diagonal_strike',
        name: 'Diagonal Smite',
        pattern: 'diagonal',
        range: 3,
        attackValue: 4,
        manaCost: { fire: 0, earth: 0, water: 0, air: 0 },
        captureMovement: false,
        knockback: 0
      }
    ],
    abilities: [
      {
        id: 'sanctuary',
        name: 'Sanctuary',
        description: 'Standing on Water terrain increases healing or spell defense by 1.'
      }
    ]
  },

  rook: {
    id: 'rook',
    name: 'Rook',
    symbol: '♜',
    pointCost: 3,
    maxHP: 6,
    defense: 2,
    movement: {
      type: 'orthogonal',
      maxDistance: 4,
      maneuversPerActivation: 1,
      passthroughFriendly: false,
      passthroughEnemy: false
    },
    activationSequence: ['MOVE_THEN_ATTACK', 'ATTACK_THEN_MOVE'],
    libraryCapacity: 2, // Holds up to 2 spell cards
    manaStorageCapacity: 0,
    attackProfiles: [
      {
        id: 'rook_heavy_charge',
        name: 'Heavy Charge',
        pattern: 'front_line',
        range: 2,
        attackValue: 6,
        manaCost: { fire: 0, earth: 0, water: 0, air: 0 },
        captureMovement: true,
        knockback: 1
      }
    ],
    abilities: [
      {
        id: 'library_vault',
        name: 'Library Vault',
        description: 'Can store up to 2 Spell cards. Stored spells do not count towards hand size limit.'
      }
    ]
  },

  knight: {
    id: 'knight',
    name: 'Knight',
    symbol: '♞',
    pointCost: 4,
    maxHP: 8,
    defense: 2,
    movement: {
      type: 'l_shape',
      maxDistance: 3,
      maneuversPerActivation: 2,
      passthroughFriendly: true,
      passthroughEnemy: true
    },
    activationSequence: ['MANEUVER_MOVE_ATTACK', 'MOVE_THEN_ATTACK'],
    libraryCapacity: 0,
    manaStorageCapacity: 0,
    attackProfiles: [
      {
        id: 'knight_cleave',
        name: 'Flank Cleave',
        pattern: 'front_arc',
        range: 1,
        attackValue: 5,
        manaCost: { fire: 0, earth: 0, water: 0, air: 0 },
        captureMovement: true,
        knockback: 0
      }
    ],
    abilities: [
      {
        id: 'leap',
        name: 'Leap',
        description: 'Can pass over both friendly and enemy pieces during movement.'
      }
    ]
  },

  queen: {
    id: 'queen',
    name: 'Queen',
    symbol: '♛',
    pointCost: 6,
    maxHP: 12,
    defense: 3,
    movement: {
      type: 'omni',
      maxDistance: 5,
      maneuversPerActivation: 2,
      passthroughFriendly: false,
      passthroughEnemy: false
    },
    activationSequence: ['MOVE_THEN_ATTACK', 'ATTACK_THEN_MOVE', 'MANEUVER_MOVE_ATTACK'],
    libraryCapacity: 1,
    manaStorageCapacity: 1,
    attackProfiles: [
      {
        id: 'queen_arcane_burst',
        name: 'Arcane Burst',
        pattern: 'all_surrounding',
        range: 3,
        attackValue: 8,
        manaCost: { fire: 0, earth: 0, water: 0, air: 0 },
        captureMovement: false,
        knockback: 0
      }
    ],
    abilities: [
      {
        id: 'sovereign_presence',
        name: 'Sovereign Presence',
        description: 'Can store 1 Mana point across rounds.'
      }
    ]
  },

  king: {
    id: 'king',
    name: 'King',
    symbol: '♚',
    pointCost: 10,
    maxHP: 20,
    defense: 3,
    movement: {
      type: 'omni',
      maxDistance: 1,
      maneuversPerActivation: 2,
      passthroughFriendly: false,
      passthroughEnemy: false
    },
    activationSequence: ['MOVE_THEN_ATTACK', 'KING_DRAW', 'MOVE_OR_ATTACK'],
    libraryCapacity: 0,
    manaStorageCapacity: 2,
    attackProfiles: [
      {
        id: 'king_royal_strike',
        name: 'Royal Decree',
        pattern: 'front_arc',
        range: 1,
        attackValue: 5,
        manaCost: { fire: 0, earth: 0, water: 0, air: 0 },
        captureMovement: true,
        knockback: 0
      }
    ],
    abilities: [
      {
        id: 'king_draw_ability',
        name: 'King Draw',
        description: 'Spend 1 Activation Point to draw 1 Card during the King’s activation.'
      },
      {
        id: 'regicide_target',
        name: 'Royal Crown',
        description: 'Primary victory target. Reducing the enemy King to 0 HP instantly triggers Regicide Victory.'
      }
    ]
  }
};
