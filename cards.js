/**
 * Tile Kings - Card Catalog Data
 * Includes 20 Land cards (Fire, Earth, Water, Air) and 20 Spell cards (Offensive, Defensive Reaction, Utility).
 */
export const DEFAULT_CARDS = [
  // --- LAND CARDS (20) ---
  // FIRE LANDS (5)
  {
    id: 'land_fire_4_free',
    name: 'Infernal Spire (Fire 4)',
    type: 'LAND',
    element: 'fire',
    apCost: 1,
    tileCount: 4,
    shape: 'FREEFORM', // User picks 4 connected tiles
    overwrites: ['neutral'],
    description: 'Converts 4 connected neutral tiles into Fire terrain.'
  },
  {
    id: 'land_fire_4_line',
    name: 'Blazing Trail (Fire 4 Line)',
    type: 'LAND',
    element: 'fire',
    apCost: 1,
    tileCount: 4,
    shape: 'LINE',
    overwrites: ['neutral'],
    description: 'Converts a 4-tile line into Fire terrain.'
  },
  {
    id: 'land_fire_6_free',
    name: 'Volcanic Eruption (Fire 6)',
    type: 'LAND',
    element: 'fire',
    apCost: 1,
    tileCount: 6,
    shape: 'FREEFORM',
    overwrites: ['neutral', 'water'],
    description: 'Converts 6 connected tiles into Fire terrain. Can overwrite Water terrain.'
  },
  {
    id: 'land_fire_3_cross',
    name: 'Pyroclastic Cross (Fire 5)',
    type: 'LAND',
    element: 'fire',
    apCost: 1,
    tileCount: 5,
    shape: 'CROSS',
    overwrites: ['neutral'],
    description: 'Converts a 5-tile cross shape into Fire terrain.'
  },
  {
    id: 'land_fire_8_surge',
    name: 'Flame Domain (Fire 8)',
    type: 'LAND',
    element: 'fire',
    apCost: 1,
    tileCount: 8,
    shape: 'FREEFORM',
    overwrites: ['neutral'],
    description: 'Converts 8 connected neutral tiles into Fire terrain.'
  },

  // EARTH LANDS (5)
  {
    id: 'land_earth_4_free',
    name: 'Stone Bastion (Earth 4)',
    type: 'LAND',
    element: 'earth',
    apCost: 1,
    tileCount: 4,
    shape: 'FREEFORM',
    overwrites: ['neutral'],
    description: 'Converts 4 connected neutral tiles into Earth terrain.'
  },
  {
    id: 'land_earth_4_square',
    name: 'Granite Plateau (Earth 4 Square)',
    type: 'LAND',
    element: 'earth',
    apCost: 1,
    tileCount: 4,
    shape: 'SQUARE_2X2',
    overwrites: ['neutral'],
    description: 'Converts a 2x2 square into Earth terrain.'
  },
  {
    id: 'land_earth_6_free',
    name: 'Crag Formation (Earth 6)',
    type: 'LAND',
    element: 'earth',
    apCost: 1,
    tileCount: 6,
    shape: 'FREEFORM',
    overwrites: ['neutral', 'air'],
    description: 'Converts 6 connected tiles into Earth terrain. Can overwrite Air terrain.'
  },
  {
    id: 'land_earth_5_tshape',
    name: 'Iron Wall (Earth 5 T-Shape)',
    type: 'LAND',
    element: 'earth',
    apCost: 1,
    tileCount: 5,
    shape: 'TSHAPE',
    overwrites: ['neutral'],
    description: 'Converts a 5-tile T-shape into Earth terrain.'
  },
  {
    id: 'land_earth_8_domain',
    name: 'Terran Fortress (Earth 8)',
    type: 'LAND',
    element: 'earth',
    apCost: 1,
    tileCount: 8,
    shape: 'FREEFORM',
    overwrites: ['neutral'],
    description: 'Converts 8 connected neutral tiles into Earth terrain.'
  },

  // WATER LANDS (5)
  {
    id: 'land_water_4_free',
    name: 'Tidal Pool (Water 4)',
    type: 'LAND',
    element: 'water',
    apCost: 1,
    tileCount: 4,
    shape: 'FREEFORM',
    overwrites: ['neutral'],
    description: 'Converts 4 connected neutral tiles into Water terrain.'
  },
  {
    id: 'land_water_4_line',
    name: 'Aqueduct Stream (Water 4 Line)',
    type: 'LAND',
    element: 'water',
    apCost: 1,
    tileCount: 4,
    shape: 'LINE',
    overwrites: ['neutral'],
    description: 'Converts a 4-tile line into Water terrain.'
  },
  {
    id: 'land_water_6_free',
    name: 'Glacial Rift (Water 6)',
    type: 'LAND',
    element: 'water',
    apCost: 1,
    tileCount: 6,
    shape: 'FREEFORM',
    overwrites: ['neutral', 'fire'],
    description: 'Converts 6 connected tiles into Water terrain. Can overwrite Fire terrain.'
  },
  {
    id: 'land_water_5_cross',
    name: 'Mist Lagoon (Water 5 Cross)',
    type: 'LAND',
    element: 'water',
    apCost: 1,
    tileCount: 5,
    shape: 'CROSS',
    overwrites: ['neutral'],
    description: 'Converts a 5-tile cross into Water terrain.'
  },
  {
    id: 'land_water_8_ocean',
    name: 'Abyssal Reach (Water 8)',
    type: 'LAND',
    element: 'water',
    apCost: 1,
    tileCount: 8,
    shape: 'FREEFORM',
    overwrites: ['neutral'],
    description: 'Converts 8 connected neutral tiles into Water terrain.'
  },

  // AIR LANDS (5)
  {
    id: 'land_air_4_free',
    name: 'Gale Valley (Air 4)',
    type: 'LAND',
    element: 'air',
    apCost: 1,
    tileCount: 4,
    shape: 'FREEFORM',
    overwrites: ['neutral'],
    description: 'Converts 4 connected neutral tiles into Air terrain.'
  },
  {
    id: 'land_air_4_line',
    name: 'Wind Corridor (Air 4 Line)',
    type: 'LAND',
    element: 'air',
    apCost: 1,
    tileCount: 4,
    shape: 'LINE',
    overwrites: ['neutral'],
    description: 'Converts a 4-tile line into Air terrain.'
  },
  {
    id: 'land_air_6_free',
    name: 'Cyclone Ridge (Air 6)',
    type: 'LAND',
    element: 'air',
    apCost: 1,
    tileCount: 6,
    shape: 'FREEFORM',
    overwrites: ['neutral', 'earth'],
    description: 'Converts 6 connected tiles into Air terrain. Can overwrite Earth terrain.'
  },
  {
    id: 'land_air_5_tshape',
    name: 'Zephyr Current (Air 5 T-Shape)',
    type: 'LAND',
    element: 'air',
    apCost: 1,
    tileCount: 5,
    shape: 'TSHAPE',
    overwrites: ['neutral'],
    description: 'Converts a 5-tile T-shape into Air terrain.'
  },
  {
    id: 'land_air_8_sky',
    name: 'Celestial Domain (Air 8)',
    type: 'LAND',
    element: 'air',
    apCost: 1,
    tileCount: 8,
    shape: 'FREEFORM',
    overwrites: ['neutral'],
    description: 'Converts 8 connected neutral tiles into Air terrain.'
  },

  // --- SPELL CARDS (20) ---
  // REACTION SPELLS (10)
  {
    id: 'spell_earth_barrier',
    name: 'Earthen Aegis',
    type: 'SPELL',
    timing: 'REACTION',
    trigger: 'ON_ATTACK_DECLARED_DEFENDER',
    apCost: 0,
    manaCost: { fire: 0, earth: 1, water: 0, air: 0 },
    canStoreInLibrary: true,
    effect: {
      type: 'BUFF_DEFENSE',
      amount: 3
    },
    description: '[Reaction] Play when your piece is attacked. Adds +3 Defense to the target defender for this attack.'
  },
  {
    id: 'spell_wind_deflect',
    name: 'Gale Deflection',
    type: 'SPELL',
    timing: 'REACTION',
    trigger: 'ON_ATTACK_DECLARED_DEFENDER',
    apCost: 0,
    manaCost: { fire: 0, earth: 0, water: 0, air: 1 },
    canStoreInLibrary: true,
    effect: {
      type: 'REDUCE_ATTACK',
      amount: 2
    },
    description: '[Reaction] Play when attacked. Reduces the incoming Attack Value by 2.'
  },
  {
    id: 'spell_water_mirror',
    name: 'Ripple Shift',
    type: 'SPELL',
    timing: 'REACTION',
    trigger: 'ON_ATTACK_DECLARED_DEFENDER',
    apCost: 0,
    manaCost: { fire: 0, earth: 0, water: 1, air: 0 },
    canStoreInLibrary: true,
    effect: {
      type: 'FREE_MANEUVER',
      amount: 1
    },
    description: '[Reaction] Play when targeted by an attack. Allows defending piece to instantly execute 1 free Maneuver (pivot).'
  },
  {
    id: 'spell_fire_counter',
    name: 'Blaze Counter',
    type: 'SPELL',
    timing: 'REACTION',
    trigger: 'ON_ATTACK_DECLARED_DEFENDER',
    apCost: 0,
    manaCost: { fire: 1, earth: 0, water: 0, air: 0 },
    canStoreInLibrary: true,
    effect: {
      type: 'DEAL_COUNTER_DAMAGE',
      amount: 2
    },
    description: '[Reaction] Play when attacked. Deals 2 direct fire damage to the attacker before combat resolves.'
  },
  {
    id: 'spell_stone_wall',
    name: 'Fortress Shell',
    type: 'SPELL',
    timing: 'REACTION',
    trigger: 'ON_ATTACK_DECLARED_DEFENDER',
    apCost: 0,
    manaCost: { fire: 0, earth: 2, water: 0, air: 0 },
    canStoreInLibrary: true,
    effect: {
      type: 'BUFF_DEFENSE',
      amount: 5
    },
    description: '[Reaction] Costs 2 Earth Mana. Grants +5 Defense against the incoming attack.'
  },

  {
    id: 'spell_frost_armor',
    name: 'Glacial Ward',
    type: 'SPELL',
    timing: 'REACTION',
    trigger: 'ON_ATTACK_DECLARED_DEFENDER',
    apCost: 0,
    manaCost: { fire: 0, earth: 0, water: 2, air: 0 },
    canStoreInLibrary: true,
    effect: {
      type: 'APPLY_STATUS_DEFENDER',
      status: 'defended',
      duration: 1
    },
    description: '[Reaction] Grants the Defended status (negates 1 capture) to defending unit.'
  },

  {
    id: 'spell_air_parry',
    name: 'Air Current Parry',
    type: 'SPELL',
    timing: 'REACTION',
    trigger: 'ON_ATTACK_DECLARED_DEFENDER',
    apCost: 0,
    manaCost: { fire: 0, earth: 0, water: 0, air: 2 },
    canStoreInLibrary: true,
    effect: {
      type: 'CANCEL_ATTACK',
    },
    description: '[Reaction] Costs 2 Air Mana. Negates the current incoming attack completely.'
  },

  {
    id: 'spell_pyro_shield',
    name: 'Ignition Feedback',
    type: 'SPELL',
    timing: 'REACTION',
    trigger: 'ON_ATTACK_DECLARED_DEFENDER',
    apCost: 0,
    manaCost: { fire: 2, earth: 0, water: 0, air: 0 },
    canStoreInLibrary: true,
    effect: {
      type: 'APPLY_STATUS_ATTACKER',
      status: 'stun',
      duration: 1
    },
    description: '[Reaction] Costs 2 Fire Mana. Applies Stun to the attacking unit.'
  },

  {
    id: 'spell_rock_shield',
    name: 'Tectonic Cover',
    type: 'SPELL',
    timing: 'REACTION',
    trigger: 'ON_ATTACK_DECLARED_DEFENDER',
    apCost: 0,
    manaCost: { fire: 0, earth: 1, water: 1, air: 0 },
    canStoreInLibrary: true,
    effect: {
      type: 'BUFF_DEFENSE',
      amount: 4
    },
    description: '[Reaction] Costs 1 Earth + 1 Water Mana. Grants +4 Defense.'
  },

  {
    id: 'spell_storm_evasive',
    name: 'Zephyr Escape',
    type: 'SPELL',
    timing: 'REACTION',
    trigger: 'ON_ATTACK_DECLARED_DEFENDER',
    apCost: 0,
    manaCost: { fire: 0, earth: 0, water: 1, air: 1 },
    canStoreInLibrary: true,
    effect: {
      type: 'REDUCE_ATTACK',
      amount: 4
    },
    description: '[Reaction] Costs 1 Water + 1 Air Mana. Reduces incoming attack power by 4.'
  },

  // OWN-TURN SPELLS (10)
  {
    id: 'spell_fire_fury',
    name: 'Flame Infusion',
    type: 'SPELL',
    timing: 'OWN_TURN',
    apCost: 1,
    manaCost: { fire: 1, earth: 0, water: 0, air: 0 },
    canStoreInLibrary: true,
    effect: {
      type: 'BUFF_ATTACK',
      amount: 3
    },
    description: '[Own Turn] Costs 1 AP + 1 Fire Mana. Adds +3 Attack to your active piece’s next strike.'
  },
  {
    id: 'spell_earth_shatter',
    name: 'Tectonic Surge',
    type: 'SPELL',
    timing: 'OWN_TURN',
    apCost: 1,
    manaCost: { fire: 0, earth: 2, water: 0, air: 0 },
    canStoreInLibrary: true,
    effect: {
      type: 'TERRAIN_ALTER',
      target: 'neutral',
      to: 'earth'
    },
    description: '[Own Turn] Costs 1 AP + 2 Earth Mana. Converts 2 target tiles into Earth terrain.'
  },
  {
    id: 'spell_haste_breeze',
    name: 'Tailwind Haste',
    type: 'SPELL',
    timing: 'OWN_TURN',
    apCost: 1,
    manaCost: { fire: 0, earth: 0, water: 0, air: 1 },
    canStoreInLibrary: true,
    effect: {
      type: 'APPLY_STATUS_TARGET',
      status: 'haste',
      duration: 1
    },
    description: '[Own Turn] Costs 1 AP + 1 Air Mana. Grants Haste status (+2 Movement) to a friendly piece.'
  },
  {
    id: 'spell_healing_rain',
    name: 'Spring Renewal',
    type: 'SPELL',
    timing: 'OWN_TURN',
    apCost: 1,
    manaCost: { fire: 0, earth: 0, water: 2, air: 0 },
    canStoreInLibrary: true,
    effect: {
      type: 'HEAL_HP',
      amount: 4
    },
    description: '[Own Turn] Costs 1 AP + 2 Water Mana. Restores 4 HP to a target friendly piece (up to max HP).'
  },
  {
    id: 'spell_empower_aura',
    name: 'Crown of Flame',
    type: 'SPELL',
    timing: 'OWN_TURN',
    apCost: 1,
    manaCost: { fire: 2, earth: 0, water: 0, air: 0 },
    canStoreInLibrary: true,
    effect: {
      type: 'APPLY_STATUS_TARGET',
      status: 'empower',
      duration: 1
    },
    description: '[Own Turn] Costs 1 AP + 2 Fire Mana. Applies Empower (+2 ATK to all attacks this turn).'
  },
  {
    id: 'spell_quicken_step',
    name: 'Quicken Swiftness',
    type: 'SPELL',
    timing: 'OWN_TURN',
    apCost: 1,
    manaCost: { fire: 0, earth: 0, water: 1, air: 1 },
    canStoreInLibrary: true,
    effect: {
      type: 'APPLY_STATUS_TARGET',
      status: 'quicken',
      duration: 1
    },
    description: '[Own Turn] Costs 1 AP + 1 Water + 1 Air Mana. Grants Quicken status (extra Maneuver).'
  },
  {
    id: 'spell_seismic_knockback',
    name: 'Seismic Push',
    type: 'SPELL',
    timing: 'OWN_TURN',
    apCost: 1,
    manaCost: { fire: 0, earth: 2, water: 0, air: 0 },
    canStoreInLibrary: true,
    effect: {
      type: 'KNOCKBACK_TARGET',
      distance: 2
    },
    description: '[Own Turn] Costs 1 AP + 2 Earth Mana. Pushes an enemy piece back 2 tiles.'
  },
  {
    id: 'spell_blasphemy_burn',
    name: 'Mana Scorch',
    type: 'SPELL',
    timing: 'OWN_TURN',
    apCost: 1,
    manaCost: { fire: 1, earth: 0, water: 0, air: 1 },
    canStoreInLibrary: true,
    effect: {
      type: 'DRAIN_MANA',
      amount: 2
    },
    description: '[Own Turn] Costs 1 AP + 1 Fire + 1 Air Mana. Destroys up to 2 of enemy unspent mana.'
  },
  {
    id: 'spell_library_fetch',
    name: 'Arcane Recall',
    type: 'SPELL',
    timing: 'OWN_TURN',
    apCost: 1,
    manaCost: { fire: 0, earth: 0, water: 1, air: 0 },
    canStoreInLibrary: false,
    effect: {
      type: 'DRAW_FROM_LIBRARY',
    },
    description: '[Own Turn] Costs 1 AP + 1 Water Mana. Retrieve any spell stored in a friendly Library for free.'
  },
  {
    id: 'spell_bless_terra',
    name: 'Terraform Blessing',
    type: 'SPELL',
    timing: 'OWN_TURN',
    apCost: 1,
    manaCost: { fire: 1, earth: 1, water: 1, air: 1 },
    canStoreInLibrary: true,
    effect: {
      type: 'SUPER_BUFF',
      amount: 4
    },
    description: '[Own Turn] Costs 1 Mana of each Element. Fully restores piece HP and grants +4 Attack and +4 Defense.'
  }
];
