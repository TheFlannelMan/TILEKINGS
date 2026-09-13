/**
 * Tile Kings Visual Card & Piece Designer - Core Application Engine
 * Compatible with direct local browser loading (file:// protocol friendly)
 */

(function(window) {
  'use strict';

  // ==========================================================================
  // 1. DATA STORE & SCHEMA MANAGER
  // ==========================================================================

  const RULES_VERSION = "Tile Kings v0.1 Prototype";
  const CARD_VERSION = "1.0";

  const DEFAULT_STATUS_EFFECTS = [
    { id: "st_stun", name: "Stun", description: "Piece cannot activate during its turn.", isCustom: false },
    { id: "st_haste", name: "Haste", description: "+2 Movement speed this activation.", isCustom: false },
    { id: "st_quicken", name: "Quicken", description: "Gain 1 extra Maneuver option.", isCustom: false },
    { id: "st_empower", name: "Empower", description: "+2 Attack value on next attack.", isCustom: false },
    { id: "st_defended", name: "Defended", description: "+2 Defense against next incoming attack.", isCustom: false },
    { id: "st_frenzy", name: "Frenzy", description: "May perform 1 additional attack block.", isCustom: false },
    { id: "st_immobile", name: "Immobile", description: "Movement reduced to 0.", isCustom: false }
  ];

  const OFFICIAL_UNIT_KEYWORDS = [
    { id: "Infantry", label: "Infantry", desc: "Foot unit or ground troop" },
    { id: "Cavalry", label: "Cavalry", desc: "Mounted or mobile troop" },
    { id: "Ranged", label: "Ranged", desc: "Includes ranged attacks" },
    { id: "Siege", label: "Siege", desc: "Heavy attacks or structure breaking" },
    { id: "Caster", label: "Caster", desc: "Spells or mana manipulation" },
    { id: "Support", label: "Support", desc: "Enhances or enables other units" },
    { id: "Emplacement", label: "Emplacement", desc: "Stationary weapon/device" },
    { id: "Fortification", label: "Fortification", desc: "Stationary defensive structure" },
    { id: "Royal", label: "Royal", desc: "High-rank royal role" },
    { id: "Commander", label: "Commander", desc: "Directs or enhances other units" },
    { id: "Sovereign", label: "Sovereign", desc: "King-equivalent (triggers Regicide)" },
    { id: "Construct", label: "Construct", desc: "Artificial or built entity" },
    { id: "Beast", label: "Beast", desc: "Monstrous or animalistic creature" },
    { id: "Undead", label: "Undead", desc: "Undead entity" },
    { id: "Elemental", label: "Elemental", desc: "Associated with an element" }
  ];

  const HEALTH_PRESETS = [
    { name: "Pawn", hp: 2, die: "Binary/Physical", type: "Binary / Physical State" },
    { name: "Bishop", hp: 4, die: "d4", type: "Mounted Die" },
    { name: "Rook", hp: 6, die: "d6", type: "Mounted Die" },
    { name: "Knight", hp: 8, die: "d8", type: "Mounted Die" },
    { name: "Queen", hp: 12, die: "d12", type: "Mounted Die" },
    { name: "King", hp: 20, die: "d20", type: "Mounted Die" }
  ];

  function createBlankPiece(name = "New Piece") {
    const id = "pc_" + Date.now().toString(36) + "_" + Math.random().toString(36).substr(2, 4);
    return {
      id,
      name,
      subtitle: "Unit / Melee",
      faction: "Neutral",
      pointsCost: 4,
      isKingEquivalent: false,
      unitKeywords: ["Infantry"],
      description: "A standard frontline unit in the battle for Tile Kings.",
      prototypeNotes: "Internal note: Test with +1 DEF on Earth terrain.",
      artworkUrl: "",
      tags: ["Unit"],
      
      // Core Stats
      maxHp: 6,
      healthDie: "d6",
      healthTrackingType: "Mounted Die",
      defense: 1,
      movementText: "3",
      maneuverText: "1",
      resistances: { Fire: 0, Earth: 0, Water: 0, Air: 0 },
      vulnerabilities: { Fire: 0, Earth: 0, Water: 0, Air: 0 },
      immunities: [],
      movementProperties: {
        passFriendly: false,
        passEnemy: false,
        jump: false,
        customText: ""
      },

      // Facing-relative Movement Pattern Grid (11x11 around center 5,5 facing UP/North)
      movementGrid: {
        "4,5": "legal",
        "3,5": "legal",
        "2,5": "legal"
      },

      // Maneuver Rules
      maneuverCount: 1,
      maneuverTiming: "Anywhere during activation",
      customManeuverText: "",

      // Activation Sequence Blocks
      activationSequence: [
        { type: "Move", isOptional: false, branchLabel: "" },
        { type: "Attack", isOptional: true, branchLabel: "" }
      ],

      // Attack Profiles
      attacks: [
        {
          id: "atk_" + Math.random().toString(36).substr(2, 5),
          name: "Standard Strike",
          attackValue: "3",
          manaCost: 0,
          manaType: "Neutral",
          rangeMin: 1,
          rangeMax: 1,
          antiKeywords: [],
          patternGrid: { "4,5": "target" },
          canAdvanceOnCapture: true,
          knockback: 0,
          statusInflicted: "",
          rulesText: "Deals 3 damage to an adjacent unit."
        }
      ],

      // Special Rules & Passive/Active Abilities
      abilities: [],
      auras: [],
      terrainAffinities: [],
      
      // Libraries & Mana Storage
      hasLibrary: false,
      libraryCapacity: 0,
      libraryNotes: "",
      canStoreMana: false,
      manaCapacity: 0,
      allowedElements: ["Fire", "Earth", "Water", "Air"],
      manaStorageNotes: ""
    };
  }

  function getDefaultPieces() {
    const pawn = createBlankPiece("Pawn");
    pawn.id = "pc_pawn";
    pawn.subtitle = "Infantry / Light";
    pawn.unitKeywords = ["Infantry"];
    pawn.pointsCost = 1;
    pawn.maxHp = 2;
    pawn.healthDie = "Binary (2/1/0)";
    pawn.healthTrackingType = "Binary / Physical State";
    pawn.defense = 0;
    pawn.movementText = "2";
    pawn.description = "Frontline foot soldier. Simple, resilient, and economical.";
    pawn.movementGrid = { "4,5": "legal", "3,5": "legal" };
    pawn.attacks = [{
      id: "atk_pawn_strike",
      name: "Frontal Thrust",
      attackValue: "2",
      manaCost: 0,
      manaType: "Neutral",
      rangeMin: 1,
      rangeMax: 1,
      antiKeywords: [],
      patternGrid: { "4,5": "target" },
      canAdvanceOnCapture: true,
      knockback: 0,
      statusInflicted: "",
      rulesText: "Attacks facing space."
    }];

    const bishop = createBlankPiece("Bishop");
    bishop.id = "pc_bishop";
    bishop.subtitle = "Caster / Diagonal";
    bishop.unitKeywords = ["Caster"];
    bishop.pointsCost = 4;
    bishop.maxHp = 4;
    bishop.healthDie = "d4";
    bishop.defense = 1;
    bishop.movementText = "4 Diagonal";
    bishop.description = "Channels elemental energies along diagonal ley lines.";
    bishop.movementGrid = { "4,4": "legal", "3,3": "legal", "4,6": "legal", "3,7": "legal" };
    bishop.attacks = [{
      id: "atk_bishop_beam",
      name: "Holy Ray",
      attackValue: "3",
      manaCost: 0,
      manaType: "Neutral",
      rangeMin: 1,
      rangeMax: 3,
      antiKeywords: [],
      patternGrid: { "4,4": "target", "3,3": "target", "2,2": "target" },
      canAdvanceOnCapture: false,
      knockback: 0,
      statusInflicted: "",
      rulesText: "Fires along diagonal line of sight up to 3 tiles."
    }];

    const rook = createBlankPiece("Rook");
    rook.id = "pc_rook";
    rook.subtitle = "Fortress / Heavy";
    rook.unitKeywords = ["Siege", "Fortification"];
    rook.pointsCost = 5;
    rook.maxHp = 6;
    rook.healthDie = "d6";
    rook.defense = 2;
    rook.movementText = "4 Orthogonal";
    rook.hasLibrary = true;
    rook.libraryCapacity = 2;
    rook.libraryNotes = "Can store up to 2 Spell Cards safely inside its vaults.";
    rook.description = "A living fortress capable of carrying ancient spell scriptures into battle.";
    rook.movementGrid = { "4,5": "legal", "3,5": "legal", "2,5": "legal", "5,4": "legal", "5,3": "legal" };
    rook.attacks = [{
      id: "atk_rook_slam",
      name: "Battering Ram",
      attackValue: "4",
      manaCost: 0,
      manaType: "Neutral",
      rangeMin: 1,
      rangeMax: 1,
      antiKeywords: [],
      patternGrid: { "4,5": "target" },
      canAdvanceOnCapture: true,
      knockback: 1,
      statusInflicted: "",
      rulesText: "Deals 4 damage and knocks the target back 1 tile."
    }];

    const knight = createBlankPiece("Knight");
    knight.id = "pc_knight";
    knight.subtitle = "Cavalry / Charger";
    knight.unitKeywords = ["Cavalry"];
    knight.pointsCost = 6;
    knight.maxHp = 8;
    knight.healthDie = "d8";
    knight.defense = 2;
    knight.movementText = "3 (L-Shape / Jump)";
    knight.movementProperties = { passFriendly: true, passEnemy: true, jump: true, customText: "Ignores intervening pieces." };
    knight.description = "Agile cavalry that vaults over obstacles to strike key targets.";
    knight.movementGrid = { "3,4": "jump", "3,6": "jump", "4,3": "jump", "4,7": "jump" };
    knight.attacks = [{
      id: "atk_knight_charge",
      name: "Lance Charge",
      attackValue: "Tiles Moved / 2 + 2",
      manaCost: 0,
      manaType: "Neutral",
      rangeMin: 1,
      rangeMax: 2,
      antiKeywords: [],
      patternGrid: { "4,5": "target", "3,5": "target" },
      canAdvanceOnCapture: true,
      knockback: 0,
      statusInflicted: "",
      rulesText: "Attack Value equals half the tiles moved this activation + 2."
    }];

    const queen = createBlankPiece("Queen");
    queen.id = "pc_queen";
    queen.subtitle = "Commander / Apex";
    queen.unitKeywords = ["Royal", "Commander"];
    queen.pointsCost = 10;
    queen.maxHp = 12;
    queen.healthDie = "d12";
    queen.defense = 2;
    queen.movementText = "5 (Any Direction)";
    queen.maneuverCount = 2;
    queen.maneuverTiming = "Anywhere during activation";
    queen.description = "The supreme warlord on the battlefield with unmatched mobility.";
    queen.movementGrid = { "4,5": "legal", "3,5": "legal", "4,4": "legal", "3,3": "legal", "5,6": "legal" };
    queen.attacks = [{
      id: "atk_queen_cleave",
      name: "Royal Cleave",
      attackValue: "5",
      manaCost: 0,
      manaType: "Neutral",
      rangeMin: 1,
      rangeMax: 2,
      antiKeywords: [],
      patternGrid: { "4,5": "target", "4,4": "target", "4,6": "target" },
      canAdvanceOnCapture: true,
      knockback: 0,
      statusInflicted: "",
      rulesText: "Strikes target and adjacent front arc tiles."
    }];

    const king = createBlankPiece("King");
    king.id = "pc_king";
    king.subtitle = "Sovereign / Monarch";
    king.unitKeywords = ["Sovereign", "Royal"];
    king.pointsCost = 8;
    king.maxHp = 20;
    king.healthDie = "d20";
    king.isKingEquivalent = true;
    king.defense = 3;
    king.movementText = "2";
    king.description = "The core sovereign of the army. Losing the King loses the game.";
    king.attacks = [{
      id: "atk_king_decree",
      name: "Sovereign Strike",
      attackValue: "4",
      manaCost: 0,
      manaType: "Neutral",
      rangeMin: 1,
      rangeMax: 1,
      antiKeywords: [],
      patternGrid: { "4,5": "target" },
      canAdvanceOnCapture: false,
      knockback: 0,
      statusInflicted: "",
      rulesText: "Deals 4 damage."
    }];

    return [king, queen, rook, knight, bishop, pawn];
  }

  function getDefaultSpells() {
    return [
      {
        id: "sp_fireball",
        name: "Flame Burst",
        element: "Fire",
        manaCost: 2,
        apCost: 1,
        timing: "Own Turn",
        target: "Area (3x3)",
        range: 4,
        duration: "Instant",
        effect: "Deals 3 damage to all pieces in a 3x3 area.",
        rulesText: "Requires Fire mana.",
        tags: ["Offensive", "AOE"]
      },
      {
        id: "sp_shield",
        name: "Earthen Barrier",
        element: "Earth",
        manaCost: 1,
        apCost: 0,
        timing: "Attack Response",
        target: "Single Friendly Unit",
        range: 3,
        duration: "1 Turn",
        effect: "Target piece gains +3 Defense against incoming attack.",
        rulesText: "Can be cast during opponent's attack step.",
        tags: ["Defensive", "Reaction"]
      }
    ];
  }

  function getDefaultLands() {
    return [
      {
        id: "ld_infernal_spire",
        name: "Infernal Spire",
        element: "Fire",
        tileCount: 4,
        placementShape: "Flexible Connected",
        allowedOverwrites: "Neutral and Earth",
        placementRestrictions: "Must connect orthogonally.",
        terrainEffects: "Friendly units standing on Fire gain +1 Attack.",
        rulesText: "Converts 4 neutral or Earth tiles into Fire terrain.",
        tags: ["Offense", "Fire"]
      },
      {
        id: "ld_bastion_ridge",
        name: "Bastion Ridge",
        element: "Earth",
        tileCount: 4,
        placementShape: "Flexible Connected",
        allowedOverwrites: "Neutral only",
        placementRestrictions: "Must connect orthogonally.",
        terrainEffects: "Units on Earth gain +1 Defense.",
        rulesText: "Converts 4 neutral tiles into Earth terrain.",
        tags: ["Defense", "Earth"]
      }
    ];
  }

  const COMMUNITY_PIECES = [
    {
      id: "comm_ember_drake",
      name: "Ember Drake",
      subtitle: "Dragon / Flying Apex",
      faction: "Ember Realm",
      pointsCost: 12,
      isKingEquivalent: false,
      maxHp: 14,
      healthDie: "d12",
      healthTrackingType: "Mounted Die",
      defense: 2,
      movementText: "4 (Fly / Jump)",
      maneuverText: "1",
      description: "A terrifying winged beast that rains fire from above.",
      tags: ["Dragon", "Flying", "Fire"],
      movementProperties: { passFriendly: true, passEnemy: true, jump: true },
      movementGrid: { "3,5": "jump", "2,5": "jump", "1,5": "jump", "3,3": "jump", "3,7": "jump" },
      activationSequence: [{ type: "Move", isOptional: false }, { type: "Attack", isOptional: true }],
      attacks: [{
        id: "atk_drake_breath",
        name: "Dragon Breath",
        attackValue: "6",
        manaCost: 1,
        manaType: "Fire",
        rangeMin: 1,
        rangeMax: 3,
        patternGrid: { "4,5": "aoe", "3,5": "aoe", "3,4": "aoe", "3,6": "aoe" },
        canAdvanceOnCapture: false,
        knockback: 1,
        statusInflicted: "Empower",
        rulesText: "Deals 6 Fire damage to target and surrounding 3x3 tiles."
      }],
      abilities: [{ name: "Volcanic Aura", type: "Passive", text: "Gains +1 Attack when starting activation on Fire terrain." }]
    },
    {
      id: "comm_iron_paladin",
      name: "Iron Paladin",
      subtitle: "Defender / Heavy Armor",
      faction: "Order of Stone",
      pointsCost: 7,
      isKingEquivalent: false,
      maxHp: 10,
      healthDie: "d8",
      healthTrackingType: "Mounted Die",
      defense: 3,
      movementText: "2",
      maneuverText: "1",
      description: "An immovable fortress clad in enchanted plate metal.",
      tags: ["Paladin", "Tank", "Earth"],
      movementGrid: { "4,5": "legal", "5,4": "legal", "5,6": "legal" },
      activationSequence: [{ type: "Maneuver", isOptional: true }, { type: "Move", isOptional: false }, { type: "Attack", isOptional: true }],
      attacks: [{
        id: "atk_paladin_smash",
        name: "Bastion Shield Slam",
        attackValue: "4",
        manaCost: 0,
        manaType: "Neutral",
        rangeMin: 1,
        rangeMax: 1,
        patternGrid: { "4,5": "target" },
        canAdvanceOnCapture: true,
        knockback: 1,
        statusInflicted: "Defended",
        rulesText: "Deals 4 damage and knocks target back 1 tile."
      }],
      abilities: [{ name: "Aegis Aura", type: "Aura", text: "Adjacent friendly units gain +1 Defense." }]
    },
    {
      id: "comm_storm_weaver",
      name: "Storm Weaver",
      subtitle: "Elementalist / Air Caster",
      faction: "Sky Citadel",
      pointsCost: 5,
      isKingEquivalent: false,
      maxHp: 6,
      healthDie: "d6",
      healthTrackingType: "Mounted Die",
      defense: 1,
      movementText: "3",
      maneuverText: "2",
      description: "Manipulates atmospheric pressure to glide across the field.",
      tags: ["Caster", "Air"],
      movementGrid: { "4,5": "legal", "3,5": "legal", "4,4": "legal", "4,6": "legal" },
      activationSequence: [{ type: "Move", isOptional: false }, { type: "Cast", isOptional: true }, { type: "Attack", isOptional: true }],
      attacks: [{
        id: "atk_lightning_bolt",
        name: "Chain Lightning",
        attackValue: "3",
        manaCost: 1,
        manaType: "Air",
        rangeMin: 1,
        rangeMax: 4,
        patternGrid: { "4,5": "target", "3,5": "target", "2,5": "target", "1,5": "target" },
        canAdvanceOnCapture: false,
        knockback: 0,
        statusInflicted: "Stun",
        rulesText: "Fires along line of sight up to 4 tiles. Inflicts Stun."
      }],
      abilities: [{ name: "Wind Dash", type: "Passive", text: "Ignores terrain movement penalties." }]
    },
    {
      id: "comm_verdant_treant",
      name: "Verdant Treant",
      subtitle: "Ancient / Nature Guardian",
      faction: "Wildwood",
      pointsCost: 8,
      isKingEquivalent: false,
      maxHp: 16,
      healthDie: "d20",
      healthTrackingType: "Mounted Die",
      defense: 3,
      movementText: "2",
      maneuverText: "1",
      description: "An ancient forest guardian rooted in deep earth magic.",
      tags: ["Guardian", "Earth", "Regen"],
      movementGrid: { "4,5": "legal", "4,4": "legal", "4,6": "legal" },
      activationSequence: [{ type: "Move", isOptional: false }, { type: "Attack", isOptional: true }],
      attacks: [{
        id: "atk_root_slap",
        name: "Entangling Root",
        attackValue: "5",
        manaCost: 0,
        manaType: "Earth",
        rangeMin: 1,
        rangeMax: 2,
        patternGrid: { "4,5": "target", "3,5": "target" },
        canAdvanceOnCapture: false,
        knockback: 0,
        statusInflicted: "Immobile",
        rulesText: "Strikes up to 2 tiles away and inflicts Immobile."
      }],
      abilities: [{ name: "Photosynthesis", type: "Passive", text: "Restores 2 HP at start of round on Earth terrain." }]
    },
    {
      id: "comm_void_spectre",
      name: "Void Spectre",
      subtitle: "Infiltrator / Shadow",
      faction: "Shadow Guild",
      pointsCost: 6,
      isKingEquivalent: false,
      maxHp: 5,
      healthDie: "d6",
      healthTrackingType: "Mounted Die",
      defense: 1,
      movementText: "4 (Phasing)",
      maneuverText: "1",
      description: "Phases through solid matter and enemy units unseen.",
      tags: ["Stealth", "Infiltrator"],
      movementProperties: { passEnemy: true, jump: true },
      movementGrid: { "4,5": "legal", "3,5": "jump", "2,5": "jump" },
      activationSequence: [{ type: "Move", isOptional: false }, { type: "Attack", isOptional: false }],
      attacks: [{
        id: "atk_soul_drain",
        name: "Soul Drain",
        attackValue: "4",
        manaCost: 0,
        manaType: "Neutral",
        rangeMin: 1,
        rangeMax: 1,
        patternGrid: { "4,5": "target" },
        canAdvanceOnCapture: true,
        knockback: 0,
        statusInflicted: "Stun",
        rulesText: "Drains life force and Stuns the defender."
      }],
      abilities: [{ name: "Phasing", type: "Passive", text: "Can pass through enemy pieces freely." }]
    },
    {
      id: "comm_royal_arbalest",
      name: "Royal Arbalest",
      subtitle: "Sniper / Ranged",
      faction: "Kingdom Guard",
      pointsCost: 5,
      isKingEquivalent: false,
      maxHp: 4,
      healthDie: "d4",
      healthTrackingType: "Mounted Die",
      defense: 1,
      movementText: "2",
      maneuverText: "1",
      description: "Elite sharpshooter equipped with heavy siege crossbow.",
      tags: ["Sniper", "Ranged"],
      movementGrid: { "4,5": "legal", "4,4": "legal", "4,6": "legal" },
      activationSequence: [{ type: "Move", isOptional: true }, { type: "Attack", isOptional: false }],
      attacks: [{
        id: "atk_heavy_bolt",
        name: "Siege Bolt",
        attackValue: "4",
        manaCost: 0,
        manaType: "Neutral",
        rangeMin: 2,
        rangeMax: 4,
        patternGrid: { "3,5": "target", "2,5": "target", "1,5": "target" },
        canAdvanceOnCapture: false,
        knockback: 0,
        statusInflicted: "",
        rulesText: "Long-range bolt. Minimum range 2, maximum range 4."
      }],
      abilities: [{ name: "Sniper Post", type: "Passive", text: "+1 Attack Value if piece did not move this turn." }]
    }
  ];

  class ProjectStore {
    constructor() {
      this.STORAGE_KEY = "tile_kings_project_v1";
      this.project = this.loadProject();
      this.activeCardId = this.project.pieces[0]?.id || null;
      this.activeCardType = "piece";
    }

    loadProject() {
      try {
        const saved = localStorage.getItem(this.STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && Array.isArray(parsed.pieces)) {
            return parsed;
          }
        }
      } catch (e) {
        console.warn("Failed to load project from localStorage:", e);
      }
      return this.createDefaultProject();
    }

    createDefaultProject() {
      return {
        rulesVersion: RULES_VERSION,
        cardVersion: CARD_VERSION,
        projectInfo: {
          id: "proj_" + Date.now().toString(36),
          name: "Tile Kings Core Set",
          author: "Tile Kings Designer",
          createdDate: new Date().toISOString().split("T")[0],
          lastModified: new Date().toISOString().split("T")[0],
          notes: "Core piece set for physical playtesting."
        },
        statusEffects: [...DEFAULT_STATUS_EFFECTS],
        pieces: getDefaultPieces(),
        spells: getDefaultSpells(),
        lands: getDefaultLands()
      };
    }

    save() {
      this.project.projectInfo.lastModified = new Date().toISOString().split("T")[0];
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.project));
    }

    getActivePiece() {
      if (this.activeCardType === "community") {
        return COMMUNITY_PIECES.find(p => p.id === this.activeCardId) || COMMUNITY_PIECES[0];
      }
      if (this.activeCardType !== "piece") return null;
      return this.project.pieces.find(p => p.id === this.activeCardId) || null;
    }

    getActiveSpell() {
      if (this.activeCardType !== "spell") return null;
      return this.project.spells.find(s => s.id === this.activeCardId) || null;
    }

    getActiveLand() {
      if (this.activeCardType !== "land") return null;
      return this.project.lands.find(l => l.id === this.activeCardId) || null;
    }

    selectCard(id, type = "piece") {
      this.activeCardId = id;
      this.activeCardType = type;
    }

    addPiece(piece = createBlankPiece()) {
      this.project.pieces.push(piece);
      this.activeCardId = piece.id;
      this.activeCardType = "piece";
      this.save();
      return piece;
    }

    duplicatePiece(id) {
      const piece = this.project.pieces.find(p => p.id === id);
      if (!piece) return null;
      const copy = JSON.parse(JSON.stringify(piece));
      copy.id = "pc_" + Date.now().toString(36) + "_" + Math.random().toString(36).substr(2, 4);
      copy.name = copy.name + " (Copy)";
      this.project.pieces.push(copy);
      this.activeCardId = copy.id;
      this.activeCardType = "piece";
      this.save();
      return copy;
    }

    deletePiece(id) {
      const idx = this.project.pieces.findIndex(p => p.id === id);
      if (idx !== -1) {
        this.project.pieces.splice(idx, 1);
        if (this.activeCardId === id) {
          this.activeCardId = this.project.pieces[0]?.id || null;
        }
        this.save();
      }
    }

    exportProjectJSON() {
      return JSON.stringify(this.project, null, 2);
    }

    importProjectJSON(jsonString) {
      try {
        const data = JSON.parse(jsonString);
        if (data && Array.isArray(data.pieces)) {
          this.project = data;
          this.activeCardId = this.project.pieces[0]?.id || null;
          this.activeCardType = "piece";
          this.save();
          return { success: true };
        }
      } catch (e) {
        return { success: false, error: e.message };
      }
      return { success: false, error: "Invalid project schema." };
    }
  }

  // ==========================================================================
  // 2. VISUAL GRID EDITOR & SVG DIAGRAM GENERATOR
  // ==========================================================================

  const MOVE_TILE_STATES = {
    none: { label: "Empty", color: "#1f2937", border: "#374151" },
    legal: { label: "Legal Move", color: "#059669", border: "#34d399", symbol: "✓" },
    path: { label: "Path Tile", color: "#2563eb", border: "#60a5fa", symbol: "•" },
    conditional: { label: "Conditional", color: "#d97706", border: "#fbbf24", symbol: "?" },
    forbidden: { label: "Forbidden", color: "#dc2626", border: "#f87171", symbol: "✕" },
    jump: { label: "Jump Target", color: "#7c3aed", border: "#c084fc", symbol: "⤾" }
  };

  const ATTACK_TILE_STATES = {
    none: { label: "Empty", color: "#1f2937", border: "#374151" },
    target: { label: "Targetable", color: "#dc2626", border: "#f87171", symbol: "🎯" },
    aoe: { label: "AOE Square", color: "#ea580c", border: "#fb923c", symbol: "💥" },
    conditional: { label: "Conditional", color: "#d97706", border: "#fbbf24", symbol: "⚡" }
  };

  class GridEditor {
    constructor(containerEl, options = {}) {
      this.containerEl = containerEl;
      this.gridSize = options.gridSize || 11;
      this.center = Math.floor(this.gridSize / 2);
      this.mode = options.mode || "movement";
      this.activeTool = options.activeTool || (this.mode === "movement" ? "legal" : "target");
      this.gridMap = options.gridMap || {};
      this.onChange = options.onChange || (() => {});
      
      this.initUI();
    }

    setMode(mode, activeTool = null) {
      this.mode = mode;
      this.activeTool = activeTool || (mode === "movement" ? "legal" : "target");
      this.renderPalette();
    }

    initUI() {
      this.containerEl.innerHTML = `
        <div class="grid-editor-wrapper">
          <div class="grid-editor-toolbar">
            <div class="grid-facing-badge">
              <span class="facing-arrow">▲</span> FACING: NORTH (UP)
            </div>
            <div class="grid-tool-palette" id="gridToolPalette"></div>
            <button class="btn-clear-grid" id="btnClearGrid">Clear Grid</button>
          </div>
          <div class="grid-board-canvas" id="gridBoardCanvas"></div>
        </div>
      `;

      this.paletteEl = this.containerEl.querySelector("#gridToolPalette");
      this.canvasEl = this.containerEl.querySelector("#gridBoardCanvas");
      this.clearBtn = this.containerEl.querySelector("#btnClearGrid");

      this.clearBtn.addEventListener("click", () => {
        this.gridMap = {};
        this.renderGrid();
        this.onChange(this.gridMap);
      });

      this.renderPalette();
      this.renderGrid();
    }

    renderPalette() {
      const states = this.mode === "movement" ? MOVE_TILE_STATES : ATTACK_TILE_STATES;
      this.paletteEl.innerHTML = Object.entries(states)
        .filter(([key]) => key !== "none")
        .map(([key, info]) => `
          <button class="tool-btn ${this.activeTool === key ? 'active' : ''}" data-tool="${key}" style="border-color: ${info.border};">
            <span class="tool-dot" style="background: ${info.color}"></span>
            ${info.label}
          </button>
        `).join("");

      this.paletteEl.querySelectorAll(".tool-btn").forEach(btn => {
        btn.addEventListener("click", (e) => {
          this.activeTool = e.currentTarget.dataset.tool;
          this.renderPalette();
        });
      });
    }

    renderGrid() {
      let html = `<div class="grid-matrix" style="grid-template-columns: repeat(${this.gridSize}, 1fr);">`;

      for (let r = 0; r < this.gridSize; r++) {
        for (let c = 0; c < this.gridSize; c++) {
          const isCenter = (r === this.center && c === this.center);
          const key = `${r},${c}`;
          const stateKey = this.gridMap[key] || "none";
          const states = this.mode === "movement" ? MOVE_TILE_STATES : ATTACK_TILE_STATES;
          const stateInfo = states[stateKey] || states.none;

          let cellContent = "";
          let cellClass = "grid-cell";

          if (isCenter) {
            cellClass += " center-piece";
            cellContent = `<span class="piece-facing-icon">▲</span>`;
          } else if (stateKey !== "none") {
            cellClass += ` state-${stateKey}`;
            cellContent = `<span class="tile-symbol">${stateInfo.symbol || ""}</span>`;
          }

          html += `
            <div class="${cellClass}" 
                 data-row="${r}" 
                 data-col="${c}" 
                 style="background-color: ${isCenter ? '#0284c7' : stateInfo.color}; border-color: ${isCenter ? '#38bdf8' : stateInfo.border};">
              ${cellContent}
            </div>
          `;
        }
      }

      html += `</div>`;
      this.canvasEl.innerHTML = html;

      this.canvasEl.querySelectorAll(".grid-cell").forEach(cell => {
        cell.addEventListener("click", (e) => {
          const r = parseInt(cell.dataset.row);
          const c = parseInt(cell.dataset.col);
          if (r === this.center && c === this.center) return;

          const key = `${r},${c}`;
          const current = this.gridMap[key];

          if (current === this.activeTool) {
            delete this.gridMap[key];
          } else {
            this.gridMap[key] = this.activeTool;
          }

          this.renderGrid();
          this.onChange(this.gridMap);
        });
      });
    }
  }

  function renderPatternSVG(gridMap = {}, mode = "movement", width = 130, height = 130) {
    const size = 11;
    const center = 5;
    const cellSize = width / size;
    const states = mode === "movement" ? MOVE_TILE_STATES : ATTACK_TILE_STATES;

    let svgCells = "";

    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        const isCenter = (r === center && c === center);
        const key = `${r},${c}`;
        const stateKey = gridMap[key] || "none";
        const info = states[stateKey] || states.none;

        const x = c * cellSize;
        const y = r * cellSize;

        let fill = isCenter ? "#0284c7" : (stateKey !== "none" ? info.color : "#111827");
        let stroke = isCenter ? "#38bdf8" : (stateKey !== "none" ? info.border : "#374151");

        svgCells += `<rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" fill="${fill}" stroke="${stroke}" stroke-width="0.5"/>`;

        if (isCenter) {
          const cx = x + cellSize / 2;
          svgCells += `<path d="M ${cx} ${y + 2} L ${x + cellSize - 3} ${y + cellSize - 3} L ${x + 3} ${y + cellSize - 3} Z" fill="#ffffff"/>`;
        } else if (stateKey !== "none") {
          const cx = x + cellSize / 2;
          const cy = y + cellSize / 2;
          svgCells += `<circle cx="${cx}" cy="${cy}" r="${cellSize * 0.25}" fill="${info.border}"/>`;
        }
      }
    }

    return `
      <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
        <rect width="${width}" height="${height}" fill="#0f172a" rx="4" />
        ${svgCells}
      </svg>
    `;
  }

  // ==========================================================================
  // 3. ACTIVATION SEQUENCE BUILDER
  // ==========================================================================

  const ACTION_BLOCK_TYPES = [
    { name: "Move", color: "#059669", icon: "👟" },
    { name: "Maneuver", color: "#0284c7", icon: "🔄" },
    { name: "Attack", color: "#dc2626", icon: "⚔️" },
    { name: "Draw", color: "#7c3aed", icon: "🎴" },
    { name: "Cast", color: "#d97706", icon: "✨" },
    { name: "Ability", color: "#2563eb", icon: "🌟" },
    { name: "Interact", color: "#0891b2", icon: "✋" },
    { name: "Custom", color: "#4b5563", icon: "📝" }
  ];

  class ActivationBuilder {
    constructor(containerEl, sequence = [], onChange = () => {}) {
      this.containerEl = containerEl;
      this.sequence = Array.isArray(sequence) ? sequence : [];
      this.onChange = onChange;
      this.initUI();
    }

    initUI() {
      this.containerEl.innerHTML = `
        <div class="activation-builder-wrapper">
          <div class="activation-toolbar">
            <label>Add Step:</label>
            <div class="add-block-buttons" id="addBlockBtns"></div>
          </div>
          <div class="sequence-list" id="sequenceList"></div>
          <div class="sequence-summary-preview" id="sequenceSummaryPreview"></div>
        </div>
      `;

      this.addBtnsEl = this.containerEl.querySelector("#addBlockBtns");
      this.listEl = this.containerEl.querySelector("#sequenceList");
      this.summaryEl = this.containerEl.querySelector("#sequenceSummaryPreview");

      this.addBtnsEl.innerHTML = ACTION_BLOCK_TYPES.map(b => `
        <button class="btn-add-action" data-type="${b.name}" style="border-color: ${b.color};">
          <span>${b.icon}</span> + ${b.name}
        </button>
      `).join("");

      this.addBtnsEl.querySelectorAll(".btn-add-action").forEach(btn => {
        btn.addEventListener("click", (e) => {
          const type = e.currentTarget.dataset.type;
          this.sequence.push({
            type,
            isOptional: type === "Attack",
            branchLabel: ""
          });
          this.render();
          this.onChange(this.sequence);
        });
      });

      this.render();
    }

    render() {
      if (this.sequence.length === 0) {
        this.listEl.innerHTML = `<div class="empty-seq-notice">No action steps added. Click buttons above to add Move, Attack, Maneuver, etc.</div>`;
      } else {
        this.listEl.innerHTML = this.sequence.map((item, idx) => {
          const info = ACTION_BLOCK_TYPES.find(b => b.name === item.type) || ACTION_BLOCK_TYPES[7];
          return `
            <div class="sequence-item-card" data-idx="${idx}" style="border-left: 4px solid ${info.color}">
              <div class="seq-item-handle">
                <span>${info.icon}</span>
                <strong>${item.type}</strong>
              </div>
              <div class="seq-item-controls">
                <label class="checkbox-inline">
                  <input type="checkbox" class="chk-optional" data-idx="${idx}" ${item.isOptional ? 'checked' : ''} />
                  Optional
                </label>
                <input type="text" class="input-branch" data-idx="${idx}" placeholder="Branch (e.g. OR)" value="${item.branchLabel || ''}" />
                <button class="btn-seq-move" data-idx="${idx}" data-dir="-1" ${idx === 0 ? 'disabled' : ''}>▲</button>
                <button class="btn-seq-move" data-idx="${idx}" data-dir="1" ${idx === this.sequence.length - 1 ? 'disabled' : ''}>▼</button>
                <button class="btn-seq-del" data-idx="${idx}">✕</button>
              </div>
            </div>
          `;
        }).join("");
      }

      this.listEl.querySelectorAll(".chk-optional").forEach(chk => {
        chk.addEventListener("change", (e) => {
          const idx = parseInt(e.target.dataset.idx);
          this.sequence[idx].isOptional = e.target.checked;
          this.renderSummary();
          this.onChange(this.sequence);
        });
      });

      this.listEl.querySelectorAll(".input-branch").forEach(inp => {
        inp.addEventListener("input", (e) => {
          const idx = parseInt(e.target.dataset.idx);
          this.sequence[idx].branchLabel = e.target.value;
          this.renderSummary();
          this.onChange(this.sequence);
        });
      });

      this.listEl.querySelectorAll(".btn-seq-move").forEach(btn => {
        btn.addEventListener("click", (e) => {
          const idx = parseInt(e.currentTarget.dataset.idx);
          const dir = parseInt(e.currentTarget.dataset.dir);
          const newIdx = idx + dir;
          if (newIdx >= 0 && newIdx < this.sequence.length) {
            const temp = this.sequence[idx];
            this.sequence[idx] = this.sequence[newIdx];
            this.sequence[newIdx] = temp;
            this.render();
            this.onChange(this.sequence);
          }
        });
      });

      this.listEl.querySelectorAll(".btn-seq-del").forEach(btn => {
        btn.addEventListener("click", (e) => {
          const idx = parseInt(e.currentTarget.dataset.idx);
          this.sequence.splice(idx, 1);
          this.render();
          this.onChange(this.sequence);
        });
      });

      this.renderSummary();
    }

    renderSummary() {
      const summaryText = formatActivationSequence(this.sequence);
      this.summaryEl.innerHTML = `<strong>Card Output Preview:</strong> <code>${summaryText}</code>`;
    }
  }

  function formatActivationSequence(sequence = []) {
    if (!sequence || sequence.length === 0) return "Standard Activation";
    return sequence.map(item => {
      let str = item.type;
      if (item.isOptional) str += " (Optional)";
      if (item.branchLabel) str = `[${item.branchLabel}] ${str}`;
      return str;
    }).join(" ➔ ");
  }

  // ==========================================================================
  // 4. LIVE CARD PREVIEW RENDERER & PNG EXPORTER
  // ==========================================================================

  class CardPreview {
    constructor(containerEl) {
      this.containerEl = containerEl;
    }

    render(piece) {
      if (!piece) {
        this.containerEl.innerHTML = `<div class="card-preview-empty">Select or create a piece to view card preview.</div>`;
        return;
      }

      const moveSvg = renderPatternSVG(piece.movementGrid, "movement", 130, 130);
      const mainAttack = piece.attacks && piece.attacks[0];
      const attackSvg = mainAttack ? renderPatternSVG(mainAttack.patternGrid, "attack", 130, 130) : "";

      const activationText = formatActivationSequence(piece.activationSequence);

      const hasAbilities = piece.abilities && piece.abilities.length > 0;
      const hasTerrain = piece.terrainAffinities && piece.terrainAffinities.length > 0;
      const hasLibrary = piece.hasLibrary && piece.libraryCapacity > 0;
      const hasManaStorage = piece.canStoreMana && piece.manaCapacity > 0;
      const hasAuras = piece.auras && piece.auras.length > 0;
      const hasTags = piece.tags && piece.tags.length > 0;

      let html = `
        <div class="tile-kings-card-frame" id="tileKingsCardFrame">
          <!-- CARD HEADER -->
          <div class="card-header">
            <div class="card-title-group">
              ${piece.isKingEquivalent ? '<span class="king-badge" title="King Equivalent">👑</span>' : ''}
              <h2 class="card-name">
                ${piece.iconUrl ? `<img src="${piece.iconUrl}" style="width: 26px; height: 26px; vertical-align: middle; margin-right: 6px; object-fit: contain;" />` : `<span style="margin-right: 6px;">${piece.symbol || '🛡️'}</span>`}
                ${escapeHTML(piece.name || "Unnamed Piece")}
              </h2>
              <div class="card-subtitle">${escapeHTML(piece.subtitle || "Unit")} ${piece.faction ? '• ' + escapeHTML(piece.faction) : ''}</div>
              ${(piece.unitKeywords && piece.unitKeywords.length > 0) ? `
                <div class="card-unit-keywords" style="font-size: 0.68rem; color: #38bdf8; font-weight: 700; margin-top: 2px; text-transform: uppercase; letter-spacing: 0.5px;">
                  ${piece.unitKeywords.map(k => `[${escapeHTML(k)}]`).join(" ")}
                </div>
              ` : ''}
            </div>
            <div class="card-cost-badge">
              <span class="cost-num">${piece.pointsCost ?? 0}</span>
              <span class="cost-lbl">PTS</span>
            </div>
          </div>

          <!-- CORE STATS STRIP -->
          <div class="card-stats-strip">
            <div class="stat-pill hp">
              <span class="stat-lbl">HP</span>
              <span class="stat-val">${piece.maxHp ?? 1}</span>
              ${piece.healthDie ? `<span class="die-sub">${escapeHTML(piece.healthDie)}</span>` : ''}
            </div>
            <div class="stat-pill def">
              <span class="stat-lbl">DEF</span>
              <span class="stat-val">${piece.defense ?? 0}</span>
            </div>
            <div class="stat-pill mov">
              <span class="stat-lbl">MOV</span>
              <span class="stat-val">${escapeHTML(String(piece.movementText ?? "0"))}</span>
            </div>
            <div class="stat-pill man">
              <span class="stat-lbl">MAN</span>
              <span class="stat-val">${escapeHTML(String(piece.maneuverText ?? "1"))}</span>
            </div>
          </div>

          <!-- RESISTANCES & VULNERABILITIES (hides if all 0) -->
          ${(piece.resistances && Object.values(piece.resistances).some(v => v > 0) || piece.vulnerabilities && Object.values(piece.vulnerabilities).some(v => v > 0)) ? `
            <div class="card-defenses-strip" style="background: rgba(15, 23, 42, 0.8); padding: 4px 10px; font-size: 0.72rem; border-top: 1px solid rgba(255,255,255,0.05); display: flex; gap: 8px; flex-wrap: wrap;">
              ${Object.entries(piece.resistances || {}).filter(([_, val]) => val > 0).map(([elem, val]) => `<span style="color: #34d399;">🛡️ Resist ${elem} ${val}</span>`).join(" ")}
              ${Object.entries(piece.vulnerabilities || {}).filter(([_, val]) => val > 0).map(([elem, val]) => `<span style="color: #f87171;">⚠️ Vuln ${elem} ${val}</span>`).join(" ")}
            </div>
          ` : ''}

          <!-- VISUAL PATTERNS & ACTIVATION BANNER -->
          <div class="card-diagrams-row">
            <div class="diagram-box">
              <div class="diagram-title">MOVEMENT PATTERN</div>
              <div class="diagram-svg-container">${moveSvg}</div>
            </div>
            ${attackSvg ? `
              <div class="diagram-box">
                <div class="diagram-title">ATTACK PATTERN</div>
                <div class="diagram-svg-container">${attackSvg}</div>
              </div>
            ` : ''}
          </div>

          <!-- ACTIVATION BANNER -->
          <div class="card-activation-banner">
            <span class="act-icon">⚡</span>
            <span class="act-label">SEQUENCE:</span>
            <span class="act-value">${escapeHTML(activationText)}</span>
          </div>

          <!-- ATTACK PROFILES -->
          <div class="card-section attacks-section">
            <div class="section-header">ATTACKS</div>
            ${(!piece.attacks || piece.attacks.length === 0) ? '<div class="no-entry">No Attacks</div>' : ''}
            ${(piece.attacks || []).map(atk => `
              <div class="attack-card-entry">
                <div class="atk-head">
                  <span class="atk-name">⚔️ ${escapeHTML(atk.name || "Attack")}</span>
                  <span class="atk-stat-tag">ATK: <strong>${escapeHTML(String(atk.attackValue ?? "0"))}</strong></span>
                  <span class="atk-stat-tag">RNG: <strong>${atk.rangeMin === atk.rangeMax ? atk.rangeMin : atk.rangeMin + '-' + atk.rangeMax}</strong></span>
                  ${atk.manaCost > 0 ? `<span class="atk-mana-tag">💧 ${atk.manaCost} ${escapeHTML(atk.manaType)}</span>` : ''}
                </div>
                <div class="atk-body">
                  ${atk.rulesText ? `<div class="atk-rules">${escapeHTML(atk.rulesText)}</div>` : ''}
                  <div class="atk-meta-flags">
                    ${(atk.antiKeywords || []).map(anti => `<span class="flag-tag" style="background: rgba(245, 158, 11, 0.2); border: 1px solid #f59e0b; color: #fef08a;">Anti-${escapeHTML(anti.keyword)} +${anti.bonus}</span>`).join(" ")}
                    ${atk.canAdvanceOnCapture ? '<span class="flag-tag">Advance on Capture</span>' : ''}
                    ${atk.knockback > 0 ? `<span class="flag-tag">Knockback ${atk.knockback}</span>` : ''}
                    ${atk.statusInflicted ? `<span class="flag-tag status">Inflicts ${escapeHTML(atk.statusInflicted)}</span>` : ''}
                  </div>
                </div>
              </div>
            `).join("")}
          </div>

          <!-- PASSIVE & ACTIVE ABILITIES (Hides if empty) -->
          ${hasAbilities ? `
            <div class="card-section abilities-section">
              <div class="section-header">ABILITIES</div>
              ${piece.abilities.map(abil => `
                <div class="ability-card-entry">
                  <div class="abil-head">
                    <strong>${escapeHTML(abil.name || "Ability")}</strong> 
                    <span class="abil-type">[${escapeHTML(abil.type || "Passive")}]</span>
                    ${abil.cost ? `<span class="abil-cost">${escapeHTML(abil.cost)}</span>` : ''}
                  </div>
                  <div class="abil-text">${escapeHTML(abil.text || abil.effect || "")}</div>
                </div>
              `).join("")}
            </div>
          ` : ''}

          <!-- TERRAIN AFFINITIES & AURAS (Hides if empty) -->
          ${(hasTerrain || hasAuras) ? `
            <div class="card-section terrain-auras-section">
              ${hasTerrain ? `
                <div class="sub-section">
                  <span class="sub-header">TERRAIN AFFINITIES:</span>
                  ${piece.terrainAffinities.map(t => `<span class="terrain-chip">${escapeHTML(t.terrain)}: ${escapeHTML(t.effect)}</span>`).join(" ")}
                </div>
              ` : ''}
              ${hasAuras ? `
                <div class="sub-section">
                  <span class="sub-header">AURAS:</span>
                  ${piece.auras.map(a => `<span class="aura-chip">${escapeHTML(a.name || 'Aura')} (R:${a.radius}): ${escapeHTML(a.effect)}</span>`).join(" ")}
                </div>
              ` : ''}
            </div>
          ` : ''}

          <!-- LIBRARY & MANA STORAGE (Hides if empty) -->
          ${(hasLibrary || hasManaStorage) ? `
            <div class="card-section storage-section">
              ${hasLibrary ? `
                <div class="storage-badge">
                  📚 <strong>Library Capacity: ${piece.libraryCapacity}</strong>
                  ${piece.libraryNotes ? `<span class="storage-note">(${escapeHTML(piece.libraryNotes)})</span>` : ''}
                </div>
              ` : ''}
              ${hasManaStorage ? `
                <div class="storage-badge">
                  🔮 <strong>Mana Storage: ${piece.manaCapacity}</strong>
                  ${piece.manaStorageNotes ? `<span class="storage-note">(${escapeHTML(piece.manaStorageNotes)})</span>` : ''}
                </div>
              ` : ''}
            </div>
          ` : ''}

          <!-- FOOTER: TAGS & FLAVOR -->
          <div class="card-footer">
            ${hasTags ? `
              <div class="card-tags-row">
                ${piece.tags.map(tag => `<span class="card-tag">#${escapeHTML(tag)}</span>`).join("")}
                ${piece.healthTrackingType ? `<span class="card-tag track-type">Mode: ${escapeHTML(piece.healthTrackingType)}</span>` : ''}
              </div>
            ` : ''}
            ${piece.description ? `<div class="card-flavor">"${escapeHTML(piece.description)}"</div>` : ''}
          </div>
        </div>

        <!-- CARD ACTION CONTROLS -->
        <div class="card-preview-actions">
          <button class="btn-card-action export-png" id="btnExportPNG">
            <span>📷</span> Export High-Res PNG
          </button>
          <button class="btn-card-action print-card" id="btnPrintCard">
            <span>📄</span> Print Card
          </button>
        </div>
      `;

      this.containerEl.innerHTML = html;

      this.containerEl.querySelector("#btnExportPNG")?.addEventListener("click", () => {
        exportCardPNG(piece);
      });

      this.containerEl.querySelector("#btnPrintCard")?.addEventListener("click", () => {
        window.print();
      });
    }
  }

  function exportCardPNG(piece) {
    const cardEl = document.getElementById("tileKingsCardFrame");
    if (!cardEl) return;

    const rect = cardEl.getBoundingClientRect();
    const w = rect.width || 360;
    const h = rect.height || 640;
    const scale = 2.5; // High resolution 300 DPI print quality

    // Clone card element
    const clone = cardEl.cloneNode(true);

    // Extract page CSS rules to embed inside SVG foreignObject
    let cssText = "";
    try {
      for (const sheet of document.styleSheets) {
        try {
          for (const rule of sheet.cssRules) {
            cssText += rule.cssText + "\n";
          }
        } catch (e) {}
      }
    } catch (e) {}

    const svgString = `
      <svg xmlns="http://www.w3.org/2000/svg" width="${w * scale}" height="${h * scale}" viewBox="0 0 ${w} ${h}">
        <style>
          ${cssText}
          body { background: transparent !important; }
          .tile-kings-card-frame {
            box-shadow: none !important;
            margin: 0 !important;
            border-radius: 18px !important;
          }
        </style>
        <foreignObject width="${w}" height="${h}">
          <div xmlns="http://www.w3.org/1999/xhtml">
            ${clone.outerHTML}
          </div>
        </foreignObject>
      </svg>
    `;

    const img = new Image();
    const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = w * scale;
      canvas.height = h * scale;
      const ctx = canvas.getContext("2d");
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, 0, 0, w * scale, h * scale);
      URL.revokeObjectURL(url);

      const link = document.createElement("a");
      link.download = `${(piece.name || "card").toLowerCase().replace(/\s+/g, "_")}_card.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    };

    img.onerror = () => {
      // Direct Canvas Fallback if SVG object fails
      const fallbackCanvas = document.createElement("canvas");
      fallbackCanvas.width = 700;
      fallbackCanvas.height = 1040;
      const ctx = fallbackCanvas.getContext("2d");
      ctx.fillStyle = "#0f172a";
      ctx.fillRect(0, 0, 700, 1040);
      ctx.strokeStyle = "#38bdf8";
      ctx.lineWidth = 6;
      ctx.strokeRect(10, 10, 680, 1020);
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 32px sans-serif";
      ctx.fillText(piece.name || "Unnamed Piece", 40, 60);

      const link = document.createElement("a");
      link.download = `${(piece.name || "card").toLowerCase().replace(/\s+/g, "_")}_card.png`;
      link.href = fallbackCanvas.toDataURL("image/png");
      link.click();
    };

    img.src = url;
  }

  // ==========================================================================
  // 5. SPELL & LAND EDITORS
  // ==========================================================================

  class LandEditor {
    constructor(containerEl, store, onUpdate = () => {}) {
      this.containerEl = containerEl;
      this.store = store;
      this.onUpdate = onUpdate;
    }

    render() {
      const land = this.store.getActiveLand();
      if (!land) {
        this.containerEl.innerHTML = `<div class="empty-notice">Select or create a Land Card to edit.</div>`;
        return;
      }

      this.containerEl.innerHTML = `
        <div class="designer-form-wrapper">
          <h3 class="form-section-title">🌍 Land Card Properties</h3>
          <div class="form-grid-2">
            <div class="form-group">
              <label>Land Name:</label>
              <input type="text" id="landName" value="${escapeAttr(land.name)}" />
            </div>
            <div class="form-group">
              <label>Element:</label>
              <select id="landElement">
                ${["Fire", "Earth", "Water", "Air", "Neutral"].map(el => `<option value="${el}" ${land.element === el ? 'selected' : ''}>${el}</option>`).join("")}
              </select>
            </div>
            <div class="form-group">
              <label>Tile Count (e.g. 4):</label>
              <input type="number" id="landTileCount" value="${land.tileCount || 4}" min="1" max="16" />
            </div>
            <div class="form-group">
              <label>Placement Shape Rule:</label>
              <select id="landShapeRule">
                <option value="Flexible Connected" ${land.placementShape === "Flexible Connected" ? 'selected' : ''}>Flexible Connected (Orthogonal)</option>
                <option value="Fixed Pattern" ${land.placementShape === "Fixed Pattern" ? 'selected' : ''}>Fixed Pattern</option>
              </select>
            </div>
          </div>
          <div class="form-group">
            <label>Allowed Overwrites:</label>
            <input type="text" id="landOverwrites" value="${escapeAttr(land.allowedOverwrites || 'Neutral only')}" />
          </div>
          <div class="form-group">
            <label>Terrain Effects granted to pieces on this land:</label>
            <input type="text" id="landEffects" value="${escapeAttr(land.terrainEffects || '')}" />
          </div>
          <div class="form-group">
            <label>Rules Text:</label>
            <textarea id="landRules" rows="3">${escapeHTML(land.rulesText || '')}</textarea>
          </div>
        </div>
      `;

      this.attachListeners(land);
    }

    attachListeners(land) {
      const bind = (id, key, isNum = false) => {
        this.containerEl.querySelector(`#${id}`)?.addEventListener("input", (e) => {
          land[key] = isNum ? parseInt(e.target.value) || 0 : e.target.value;
          this.store.save();
          this.onUpdate();
        });
      };

      bind("landName", "name");
      bind("landElement", "element");
      bind("landTileCount", "tileCount", true);
      bind("landShapeRule", "placementShape");
      bind("landOverwrites", "allowedOverwrites");
      bind("landEffects", "terrainEffects");
      bind("landRules", "rulesText");
    }
  }

  class SpellEditor {
    constructor(containerEl, store, onUpdate = () => {}) {
      this.containerEl = containerEl;
      this.store = store;
      this.onUpdate = onUpdate;
    }

    render() {
      const spell = this.store.getActiveSpell();
      if (!spell) {
        this.containerEl.innerHTML = `<div class="empty-notice">Select or create a Spell Card to edit.</div>`;
        return;
      }

      this.containerEl.innerHTML = `
        <div class="designer-form-wrapper">
          <h3 class="form-section-title">✨ Spell Card Properties</h3>
          <div class="form-grid-2">
            <div class="form-group">
              <label>Spell Name:</label>
              <input type="text" id="spName" value="${escapeAttr(spell.name)}" />
            </div>
            <div class="form-group">
              <label>Element / Mana Identity:</label>
              <select id="spElement">
                ${["Fire", "Earth", "Water", "Air", "Neutral"].map(el => `<option value="${el}" ${spell.element === el ? 'selected' : ''}>${el}</option>`).join("")}
              </select>
            </div>
            <div class="form-group">
              <label>Mana Cost:</label>
              <input type="number" id="spManaCost" value="${spell.manaCost ?? 1}" min="0" />
            </div>
            <div class="form-group">
              <label>Activation Cost (AP):</label>
              <input type="number" id="spApCost" value="${spell.apCost ?? 1}" min="0" />
            </div>
          </div>
          <div class="form-group">
            <label>Spell Effect:</label>
            <textarea id="spEffect" rows="3">${escapeHTML(spell.effect || '')}</textarea>
          </div>
        </div>
      `;

      this.attachListeners(spell);
    }

    attachListeners(spell) {
      const bind = (id, key, isNum = false) => {
        this.containerEl.querySelector(`#${id}`)?.addEventListener("input", (e) => {
          spell[key] = isNum ? parseInt(e.target.value) || 0 : e.target.value;
          this.store.save();
          this.onUpdate();
        });
      };

      bind("spName", "name");
      bind("spElement", "element");
      bind("spManaCost", "manaCost", true);
      bind("spApCost", "apCost", true);
      bind("spEffect", "effect");
    }
  }

  // ==========================================================================
  // 6. MAIN DESIGNER APPLICATION CONTROLLER
  // ==========================================================================

  class DesignerApp {
    constructor(containerEl) {
      this.containerEl = containerEl;
      this.store = new ProjectStore();
      this.activeTab = "basics";
      this.initLayout();
    }

    initLayout() {
      this.containerEl.innerHTML = `
        <div class="designer-app-wrapper">
          <!-- TOP TOOLBAR -->
          <div class="designer-topbar">
            <div class="topbar-brand">
              <span class="brand-icon">🎨</span>
              <strong>TILE KINGS DESIGNER</strong>
              <span class="rules-badge">${this.store.project.rulesVersion}</span>
            </div>
            <div class="topbar-project-info">
              <label>Project:</label>
              <input type="text" id="projectNameInput" class="project-name-input" value="${escapeAttr(this.store.project.projectInfo.name)}" />
            </div>
            <div class="topbar-actions">
              <button class="btn-topbar" id="btnNewPiece">➕ New Piece</button>
              <button class="btn-topbar" id="btnSaveArmy" style="background: #059669; color: #fff; border-color: #34d399;">🎮 Save Army for Sandbox</button>
              <button class="btn-topbar" id="btnExportProject">💾 Export JSON</button>
              <button class="btn-topbar" id="btnImportProject">📂 Import JSON</button>
              <input type="file" id="fileImportInput" accept=".json" style="display:none;" />
            </div>
          </div>

          <!-- 3-COLUMN DESKTOP WORKSPACE -->
          <div class="designer-workspace">
            <!-- LEFT SIDEBAR -->
            <div class="designer-sidebar" id="designerSidebar">
              <div class="sidebar-search">
                <input type="text" id="librarySearch" placeholder="Search cards..." />
              </div>
              <div class="sidebar-card-types">
                <button class="type-tab active" data-type="piece">Pieces (${this.store.project.pieces.length})</button>
                <button class="type-tab" data-type="spell">Spells (${this.store.project.spells.length})</button>
                <button class="type-tab" data-type="land">Lands (${this.store.project.lands.length})</button>
                <button class="type-tab" data-type="community" style="color: #f59e0b;">🌐 Gallery (${COMMUNITY_PIECES.length})</button>
              </div>
              <div class="sidebar-item-list" id="sidebarItemList"></div>
            </div>

            <!-- CENTER WORKSPACE -->
            <div class="designer-center-editor" id="designerCenterEditor">
              <div class="editor-tabs-bar" id="editorTabsBar">
                <button class="tab-btn active" data-tab="basics">Basics</button>
                <button class="tab-btn" data-tab="stats">HP & Stats</button>
                <button class="tab-btn" data-tab="movement">Movement Grid</button>
                <button class="tab-btn" data-tab="activation">Activation</button>
                <button class="tab-btn" data-tab="attacks">Attacks</button>
                <button class="tab-btn" data-tab="abilities">Abilities</button>
                <button class="tab-btn" data-tab="special">Library & Mana</button>
                <button class="tab-btn" data-tab="notes">Notes</button>
              </div>
              <div class="editor-content-panel" id="editorContentPanel"></div>
            </div>

            <!-- RIGHT PANEL -->
            <div class="designer-right-preview" id="designerRightPreview">
              <div class="preview-panel-header">
                <h3>LIVE CARD PREVIEW</h3>
              </div>
              <div class="preview-card-mount" id="previewCardMount"></div>
            </div>
          </div>
        </div>
      `;

      this.cardPreview = new CardPreview(this.containerEl.querySelector("#previewCardMount"));
      this.attachTopbarListeners();
      this.renderSidebar();
      this.renderCenterEditor();
      this.updatePreview();
    }

    attachTopbarListeners() {
      const projInput = this.containerEl.querySelector("#projectNameInput");
      projInput.addEventListener("input", (e) => {
        this.store.project.projectInfo.name = e.target.value;
        this.store.save();
      });

      this.containerEl.querySelector("#btnNewPiece").addEventListener("click", () => {
        const piece = this.store.addPiece();
        this.renderSidebar();
        this.renderCenterEditor();
        this.updatePreview();
      });

      this.containerEl.querySelector("#btnSaveArmy")?.addEventListener("click", () => {
        this.openArmyBuilderModal();
      });

      this.containerEl.querySelector("#btnExportProject").addEventListener("click", () => {
        const json = this.store.exportProjectJSON();
        const blob = new Blob([json], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${this.store.project.projectInfo.name.toLowerCase().replace(/\s+/g, '_')}.json`;
        a.click();
      });

      const fileInput = this.containerEl.querySelector("#fileImportInput");
      this.containerEl.querySelector("#btnImportProject").addEventListener("click", () => {
        fileInput.click();
      });

      fileInput.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (evt) => {
            const res = this.store.importProjectJSON(evt.target.result);
            if (res.success) {
              this.renderSidebar();
              this.renderCenterEditor();
              this.updatePreview();
              alert("Project imported successfully!");
            } else {
              alert("Import failed: " + res.error);
            }
          };
          reader.readAsText(file);
        }
      });

      const searchInp = this.containerEl.querySelector("#librarySearch");
      searchInp.addEventListener("input", () => this.renderSidebar());

      this.containerEl.querySelectorAll(".sidebar-card-types .type-tab").forEach(tab => {
        tab.addEventListener("click", (e) => {
          this.containerEl.querySelectorAll(".sidebar-card-types .type-tab").forEach(t => t.classList.remove("active"));
          e.currentTarget.classList.add("active");
          this.store.activeCardType = e.currentTarget.dataset.type;
          if (this.store.activeCardType === "piece") {
            this.store.activeCardId = this.store.project.pieces[0]?.id || null;
          } else if (this.store.activeCardType === "spell") {
            this.store.activeCardId = this.store.project.spells[0]?.id || null;
          } else if (this.store.activeCardType === "land") {
            this.store.activeCardId = this.store.project.lands[0]?.id || null;
          } else if (this.store.activeCardType === "community") {
            this.store.activeCardId = COMMUNITY_PIECES[0]?.id || null;
          }
          this.renderSidebar();
          this.renderCenterEditor();
          this.updatePreview();
        });
      });

      this.containerEl.querySelectorAll("#editorTabsBar .tab-btn").forEach(tab => {
        tab.addEventListener("click", (e) => {
          this.containerEl.querySelectorAll("#editorTabsBar .tab-btn").forEach(t => t.classList.remove("active"));
          e.currentTarget.classList.add("active");
          this.activeTab = e.currentTarget.dataset.tab;
          this.renderCenterEditor();
        });
      });
    }

    renderSidebar() {
      const listEl = this.containerEl.querySelector("#sidebarItemList");
      const query = this.containerEl.querySelector("#librarySearch").value.toLowerCase();
      const type = this.store.activeCardType;

      let items = [];
      if (type === "piece") items = this.store.project.pieces;
      else if (type === "spell") items = this.store.project.spells;
      else if (type === "land") items = this.store.project.lands;
      else if (type === "community") items = COMMUNITY_PIECES;

      const filtered = items.filter(item => (item.name || "").toLowerCase().includes(query));

      listEl.innerHTML = filtered.map(item => `
        <div class="sidebar-item ${item.id === this.store.activeCardId ? 'active' : ''}" data-id="${item.id}">
          <div class="item-main">
            <span class="item-icon">${item.iconUrl ? `<img src="${item.iconUrl}" style="width: 20px; height: 20px; object-fit: contain; vertical-align: middle;" />` : (item.symbol || (type === 'piece' ? (item.isKingEquivalent ? '👑' : '🛡️') : (type === 'spell' ? '✨' : '🌍')))}</span>
            <strong class="item-name">${escapeHTML(item.name || 'Unnamed')}</strong>
          </div>
          <div class="item-meta">
            ${(type === 'piece' || type === 'community') ? `${item.pointsCost ?? 0} PTS • HP ${item.maxHp ?? 1}` : ''}
            ${type === 'spell' ? `Mana ${item.manaCost ?? 0} • ${item.element}` : ''}
            ${type === 'land' ? `${item.tileCount ?? 4} Tiles • ${item.element}` : ''}
          </div>
          ${type === 'community' ? `
            <button class="btn-import-comm" data-id="${item.id}" style="margin-top: 4px; background: #059669; color: #fff; border: none; padding: 3px 8px; border-radius: 4px; font-size: 0.72rem; font-weight: 700; cursor: pointer;">
              📥 Import into My Set
            </button>
          ` : `
            <div class="item-actions">
              <button class="btn-item-action btn-dup" data-id="${item.id}" title="Duplicate">📋</button>
              <button class="btn-item-action btn-del" data-id="${item.id}" title="Delete">🗑️</button>
            </div>
          `}
        </div>
      `).join("");

      listEl.querySelectorAll(".sidebar-item").forEach(el => {
        el.addEventListener("click", (e) => {
          if (e.target.closest(".btn-item-action") || e.target.closest(".btn-import-comm")) return;
          this.store.selectCard(el.dataset.id, type);
          this.renderSidebar();
          this.renderCenterEditor();
          this.updatePreview();
        });
      });

      listEl.querySelectorAll(".btn-import-comm").forEach(btn => {
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          const id = e.currentTarget.dataset.id;
          const commItem = COMMUNITY_PIECES.find(p => p.id === id);
          if (commItem) {
            const imported = JSON.parse(JSON.stringify(commItem));
            imported.id = "pc_" + Date.now().toString(36) + "_" + Math.random().toString(36).substr(2, 4);
            this.store.addPiece(imported);
            alert(`Added "${commItem.name}" to your custom piece collection!`);
            this.store.activeCardType = "piece";
            this.renderSidebar();
            this.renderCenterEditor();
            this.updatePreview();
          }
        });
      });

      listEl.querySelectorAll(".btn-dup").forEach(btn => {
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          const id = e.currentTarget.dataset.id;
          if (type === "piece") this.store.duplicatePiece(id);
          this.renderSidebar();
          this.renderCenterEditor();
          this.updatePreview();
        });
      });

      listEl.querySelectorAll(".btn-del").forEach(btn => {
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          const id = e.currentTarget.dataset.id;
          if (confirm("Delete this card?")) {
            if (type === "piece") this.store.deletePiece(id);
            this.renderSidebar();
            this.renderCenterEditor();
            this.updatePreview();
          }
        });
      });
    }

    renderCenterEditor() {
      const panel = this.containerEl.querySelector("#editorContentPanel");
      const type = this.store.activeCardType;

      if (type === "land") {
        this.landEditor = new LandEditor(panel, this.store, () => this.updatePreview());
        this.landEditor.render();
        return;
      }

      if (type === "spell") {
        this.spellEditor = new SpellEditor(panel, this.store, () => this.updatePreview());
        this.spellEditor.render();
        return;
      }

      const piece = this.store.getActivePiece();
      if (!piece) {
        panel.innerHTML = `<div class="empty-notice">No piece selected. Create or select a piece from the left sidebar.</div>`;
        return;
      }

      switch (this.activeTab) {
        case "basics": this.renderBasicsTab(panel, piece); break;
        case "stats": this.renderStatsTab(panel, piece); break;
        case "movement": this.renderMovementTab(panel, piece); break;
        case "activation": this.renderActivationTab(panel, piece); break;
        case "attacks": this.renderAttacksTab(panel, piece); break;
        case "abilities": this.renderAbilitiesTab(panel, piece); break;
        case "special": this.renderSpecialTab(panel, piece); break;
        case "notes": this.renderNotesTab(panel, piece); break;
      }
    }

    renderBasicsTab(panel, piece) {
      const PRESET_ICONS = ["⚔️", "🛡️", "🏹", "🐉", "🧙", "👑", "♟️", "♞", "♜", "♝", "♛", "♚", "🦁", "🦅", "🐺", "💀", "🔮", "🔥", "🌍", "💧", "💨", "⚡", "🌿", "💎", "🔱", "🎯", "🔨", "🪓"];
      piece.unitKeywords = piece.unitKeywords || (piece.isKingEquivalent ? ["Sovereign", "Royal"] : ["Infantry"]);

      panel.innerHTML = `
        <div class="designer-form-wrapper">
          <h3 class="form-section-title">📝 Basic Piece Information & Icon</h3>

          <div class="form-group icon-picker-card">
            <label>Piece Icon & Symbol:</label>
            <div class="icon-palette-bar">
              ${PRESET_ICONS.map(sym => `
                <button class="btn-icon-symbol ${piece.symbol === sym ? 'active' : ''}" data-symbol="${sym}">${sym}</button>
              `).join("")}
            </div>

            <div class="form-grid-2" style="margin-top: 10px;">
              <div class="form-group">
                <label>Custom Symbol / Emoji:</label>
                <input type="text" id="pieceSymbolInput" value="${escapeAttr(piece.symbol || '🛡️')}" placeholder="Type any emoji (e.g. 🐉)" />
              </div>
              <div class="form-group">
                <label>Or Upload Custom Image Icon:</label>
                <input type="file" id="iconFileInput" accept="image/*" style="font-size: 0.8rem;" />
              </div>
            </div>
            ${piece.iconUrl ? `
              <div class="icon-preview-row">
                <span>Active Image Icon:</span>
                <img src="${piece.iconUrl}" class="preview-custom-icon" style="width: 32px; height: 32px; object-fit: contain; border-radius: 4px;" />
                <button id="btnClearIconImg" style="background: #dc2626; color: #fff; border: none; padding: 2px 8px; border-radius: 4px; font-size: 0.75rem; cursor: pointer;">Remove Image</button>
              </div>
            ` : ''}
          </div>

          <div class="form-grid-2">
            <div class="form-group">
              <label>Piece Name:</label>
              <input type="text" id="pieceName" value="${escapeAttr(piece.name)}" />
            </div>
            <div class="form-group">
              <label>Subtitle / Class / Type:</label>
              <input type="text" id="pieceSubtitle" value="${escapeAttr(piece.subtitle)}" />
            </div>
            <div class="form-group">
              <label>Faction (Optional):</label>
              <input type="text" id="pieceFaction" value="${escapeAttr(piece.faction || '')}" />
            </div>
            <div class="form-group">
              <label>Points Cost:</label>
              <input type="number" id="piecePoints" value="${piece.pointsCost ?? 1}" min="0" />
            </div>
          </div>

          <!-- OFFICIAL RULES v0.1 UNIT KEYWORDS -->
          <div class="form-group keywords-picker-card" style="background: rgba(15, 23, 42, 0.6); padding: 12px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1); margin-bottom: 16px;">
            <label style="font-weight: 700; color: #38bdf8; display: block; margin-bottom: 4px;">🏷️ Official Rules v0.1 Unit Keywords:</label>
            <p style="font-size: 0.75rem; color: #94a3b8; margin-bottom: 8px;">Select keywords defining this unit for targeting and anti-bonuses:</p>
            <div class="keywords-checkbox-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: 6px;">
              ${OFFICIAL_UNIT_KEYWORDS.map(kw => {
                const isChecked = piece.unitKeywords.includes(kw.id);
                return `
                  <label style="display: flex; align-items: center; gap: 6px; font-size: 0.78rem; background: ${isChecked ? 'rgba(56, 189, 248, 0.2)' : 'rgba(0,0,0,0.2)'}; padding: 4px 8px; border-radius: 4px; border: 1px solid ${isChecked ? '#38bdf8' : '#334155'}; cursor: pointer;" title="${kw.desc}">
                    <input type="checkbox" class="chk-unit-kw" data-kw="${kw.id}" ${isChecked ? 'checked' : ''} />
                    <span>${kw.label}</span>
                  </label>
                `;
              }).join("")}
            </div>
          </div>

          <div class="form-group checkbox-group-card">
            <label class="checkbox-label">
              <input type="checkbox" id="chkKingEq" ${piece.isKingEquivalent ? 'checked' : ''} />
              👑 <strong>King-Equivalent Piece</strong> (Required for legal army construction)
            </label>
          </div>
          <div class="form-group">
            <label>Description / Flavor Text:</label>
            <textarea id="pieceDesc" rows="3">${escapeHTML(piece.description || '')}</textarea>
          </div>
          <div class="form-group">
            <label>Tags / Keywords (Comma separated):</label>
            <input type="text" id="pieceTags" value="${escapeAttr((piece.tags || []).join(', '))}" />
          </div>
        </div>
      `;

      panel.querySelectorAll(".chk-unit-kw").forEach(chk => {
        chk.addEventListener("change", (e) => {
          const kw = e.target.dataset.kw;
          piece.unitKeywords = piece.unitKeywords || [];
          if (e.target.checked) {
            if (!piece.unitKeywords.includes(kw)) piece.unitKeywords.push(kw);
            if (kw === "Sovereign") piece.isKingEquivalent = true;
          } else {
            piece.unitKeywords = piece.unitKeywords.filter(k => k !== kw);
            if (kw === "Sovereign") piece.isKingEquivalent = false;
          }
          this.store.save();
          this.renderBasicsTab(panel, piece);
          this.renderSidebar();
          this.updatePreview();
        });
      });

      panel.querySelectorAll(".btn-icon-symbol").forEach(btn => {
        btn.addEventListener("click", (e) => {
          piece.symbol = e.currentTarget.dataset.symbol;
          this.store.save();
          this.renderBasicsTab(panel, piece);
          this.renderSidebar();
          this.updatePreview();
        });
      });

      panel.querySelector("#pieceSymbolInput")?.addEventListener("input", (e) => {
        piece.symbol = e.target.value;
        this.store.save();
        this.renderSidebar();
        this.updatePreview();
      });

      panel.querySelector("#iconFileInput")?.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (evt) => {
            piece.iconUrl = evt.target.result;
            this.store.save();
            this.renderBasicsTab(panel, piece);
            this.renderSidebar();
            this.updatePreview();
          };
          reader.readAsDataURL(file);
        }
      });

      panel.querySelector("#btnClearIconImg")?.addEventListener("click", () => {
        delete piece.iconUrl;
        this.store.save();
        this.renderBasicsTab(panel, piece);
        this.renderSidebar();
        this.updatePreview();
      });

      const bind = (id, key, isNum = false, isBool = false) => {
        panel.querySelector(`#${id}`)?.addEventListener("input", (e) => {
          if (isBool) piece[key] = e.target.checked;
          else if (isNum) piece[key] = parseInt(e.target.value) || 0;
          else piece[key] = e.target.value;
          this.store.save();
          this.renderSidebar();
          this.updatePreview();
        });
      };

      bind("pieceName", "name");
      bind("pieceSubtitle", "subtitle");
      bind("pieceFaction", "faction");
      bind("piecePoints", "pointsCost", true);
      bind("chkKingEq", "isKingEquivalent", false, true);
      bind("pieceDesc", "description");

      panel.querySelector("#pieceTags")?.addEventListener("input", (e) => {
        piece.tags = e.target.value.split(",").map(s => s.trim()).filter(Boolean);
        this.store.save();
        this.updatePreview();
      });
    }

    renderStatsTab(panel, piece) {
      piece.resistances = piece.resistances || { Fire: 0, Earth: 0, Water: 0, Air: 0 };
      piece.vulnerabilities = piece.vulnerabilities || { Fire: 0, Earth: 0, Water: 0, Air: 0 };

      panel.innerHTML = `
        <div class="designer-form-wrapper">
          <h3 class="form-section-title">❤️ Health & Core Piece Stats</h3>
          <div class="preset-hp-bar">
            <label>Quick Presets:</label>
            ${HEALTH_PRESETS.map(p => `
              <button class="btn-preset-hp" data-hp="${p.hp}" data-die="${p.die}" data-type="${p.type}">
                ${p.name} (${p.hp} HP / ${p.die})
              </button>
            `).join("")}
          </div>
          <div class="form-grid-2">
            <div class="form-group">
              <label>Maximum HP:</label>
              <input type="number" id="pieceMaxHp" value="${piece.maxHp ?? 1}" min="1" />
            </div>
            <div class="form-group">
              <label>Suggested Health Die:</label>
              <select id="pieceHealthDie">
                ${["d4", "d6", "d8", "d12", "d20", "Binary (2/1/0)", "Custom"].map(d => `<option value="${d}" ${piece.healthDie === d ? 'selected' : ''}>${d}</option>`).join("")}
              </select>
            </div>
            <div class="form-group">
              <label>Defense Value:</label>
              <input type="number" id="pieceDef" value="${piece.defense ?? 0}" min="0" />
            </div>
            <div class="form-group">
              <label>Movement Spec:</label>
              <input type="text" id="pieceMovText" value="${escapeAttr(String(piece.movementText ?? '3'))}" />
            </div>
          </div>

          <h4 class="form-sub-title" style="margin-top: 16px; margin-bottom: 8px; color: #38bdf8;">🛡️ Elemental Resistances & Vulnerabilities</h4>
          <div class="form-grid-2">
            <div class="form-group">
              <label>🔥 Fire (Resist / Vulnerable):</label>
              <div style="display: flex; gap: 8px;">
                <input type="number" class="inp-res" data-elem="Fire" value="${piece.resistances.Fire ?? 0}" min="0" placeholder="Resist Fire" style="width: 50%;" />
                <input type="number" class="inp-vul" data-elem="Fire" value="${piece.vulnerabilities.Fire ?? 0}" min="0" placeholder="Vulnerable Fire" style="width: 50%;" />
              </div>
            </div>
            <div class="form-group">
              <label>🪨 Earth (Resist / Vulnerable):</label>
              <div style="display: flex; gap: 8px;">
                <input type="number" class="inp-res" data-elem="Earth" value="${piece.resistances.Earth ?? 0}" min="0" placeholder="Resist Earth" style="width: 50%;" />
                <input type="number" class="inp-vul" data-elem="Earth" value="${piece.vulnerabilities.Earth ?? 0}" min="0" placeholder="Vulnerable Earth" style="width: 50%;" />
              </div>
            </div>
            <div class="form-group">
              <label>💧 Water (Resist / Vulnerable):</label>
              <div style="display: flex; gap: 8px;">
                <input type="number" class="inp-res" data-elem="Water" value="${piece.resistances.Water ?? 0}" min="0" placeholder="Resist Water" style="width: 50%;" />
                <input type="number" class="inp-vul" data-elem="Water" value="${piece.vulnerabilities.Water ?? 0}" min="0" placeholder="Vulnerable Water" style="width: 50%;" />
              </div>
            </div>
            <div class="form-group">
              <label>💨 Air (Resist / Vulnerable):</label>
              <div style="display: flex; gap: 8px;">
                <input type="number" class="inp-res" data-elem="Air" value="${piece.resistances.Air ?? 0}" min="0" placeholder="Resist Air" style="width: 50%;" />
                <input type="number" class="inp-vul" data-elem="Air" value="${piece.vulnerabilities.Air ?? 0}" min="0" placeholder="Vulnerable Air" style="width: 50%;" />
              </div>
            </div>
          </div>
        </div>
      `;

      panel.querySelectorAll(".btn-preset-hp").forEach(btn => {
        btn.addEventListener("click", (e) => {
          piece.maxHp = parseInt(e.currentTarget.dataset.hp);
          piece.healthDie = e.currentTarget.dataset.die;
          piece.healthTrackingType = e.currentTarget.dataset.type;
          this.store.save();
          this.renderStatsTab(panel, piece);
          this.updatePreview();
        });
      });

      panel.querySelectorAll(".inp-res").forEach(inp => {
        inp.addEventListener("input", (e) => {
          const elem = e.target.dataset.elem;
          piece.resistances[elem] = parseInt(e.target.value) || 0;
          this.store.save();
          this.updatePreview();
        });
      });

      panel.querySelectorAll(".inp-vul").forEach(inp => {
        inp.addEventListener("input", (e) => {
          const elem = e.target.dataset.elem;
          piece.vulnerabilities[elem] = parseInt(e.target.value) || 0;
          this.store.save();
          this.updatePreview();
        });
      });

      const bind = (id, key, isNum = false) => {
        panel.querySelector(`#${id}`)?.addEventListener("input", (e) => {
          piece[key] = isNum ? parseInt(e.target.value) || 0 : e.target.value;
          this.store.save();
          this.updatePreview();
        });
      };

      bind("pieceMaxHp", "maxHp", true);
      bind("pieceHealthDie", "healthDie");
      bind("pieceDef", "defense", true);
      bind("pieceMovText", "movementText");
    }

    renderMovementTab(panel, piece) {
      panel.innerHTML = `
        <div class="designer-form-wrapper">
          <h3 class="form-section-title">🧭 Visual Movement Pattern Grid</h3>
          <div id="movementGridContainer"></div>
        </div>
      `;

      const container = panel.querySelector("#movementGridContainer");
      new GridEditor(container, {
        mode: "movement",
        gridMap: piece.movementGrid || {},
        onChange: (newMap) => {
          piece.movementGrid = newMap;
          this.store.save();
          this.updatePreview();
        }
      });
    }

    renderActivationTab(panel, piece) {
      panel.innerHTML = `
        <div class="designer-form-wrapper">
          <h3 class="form-section-title">⚡ Activation Sequence</h3>
          <div id="activationBuilderContainer"></div>
        </div>
      `;

      const builderMount = panel.querySelector("#activationBuilderContainer");
      new ActivationBuilder(builderMount, piece.activationSequence, (seq) => {
        piece.activationSequence = seq;
        this.store.save();
        this.updatePreview();
      });
    }

    renderAttacksTab(panel, piece) {
      piece.attacks = piece.attacks || [];
      this.activeAtkIdx = this.activeAtkIdx || 0;
      if (this.activeAtkIdx >= piece.attacks.length) this.activeAtkIdx = 0;

      const atk = piece.attacks[this.activeAtkIdx];

      panel.innerHTML = `
        <div class="designer-form-wrapper">
          <div class="attacks-manager-header">
            <h3 class="form-section-title">⚔️ Attack Profiles (${piece.attacks.length})</h3>
            <button class="btn-add-atk" id="btnAddAttack">➕ Add Attack</button>
          </div>
          ${piece.attacks.length === 0 ? '<div class="empty-notice">No attacks defined.</div>' : `
            <div class="attack-tabs-bar">
              ${piece.attacks.map((a, idx) => `
                <button class="atk-tab-btn ${idx === this.activeAtkIdx ? 'active' : ''}" data-idx="${idx}">
                  ⚔️ ${escapeHTML(a.name || 'Attack ' + (idx + 1))}
                </button>
              `).join("")}
            </div>
            ${atk ? `
              <div class="active-attack-form">
                <div class="form-grid-2">
                  <div class="form-group">
                    <label>Attack Name:</label>
                    <input type="text" id="atkName" value="${escapeAttr(atk.name)}" />
                  </div>
                  <div class="form-group">
                    <label>Attack Value / Formula:</label>
                    <input type="text" id="atkValue" value="${escapeAttr(String(atk.attackValue ?? '3'))}" />
                  </div>
                </div>

                <!-- ANTI-X KEYWORD TRAITS -->
                <div class="form-group" style="background: rgba(15, 23, 42, 0.6); padding: 12px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1); margin: 12px 0;">
                  <label style="font-weight: 700; color: #f59e0b; display: block; margin-bottom: 4px;">⚔️ Anti-X Traits (Bonus ATK vs Unit Keywords):</label>
                  <div class="anti-x-list" id="antiXList">
                    ${(!atk.antiKeywords || atk.antiKeywords.length === 0) ? '<div style="font-size: 0.75rem; color: #94a3b8;">No Anti-X traits. Select below to add Anti-Cavalry, Anti-Siege, etc.</div>' : atk.antiKeywords.map((anti, aIdx) => `
                      <div class="anti-x-row" style="display: flex; gap: 8px; align-items: center; margin-top: 6px;">
                        <span style="font-size: 0.8rem; color: #f59e0b; font-weight: 700; min-width: 110px;">Anti-${escapeHTML(anti.keyword)}</span>
                        <span style="font-size: 0.8rem; color: #94a3b8;">+</span>
                        <input type="number" class="inp-anti-bonus" data-idx="${aIdx}" value="${anti.bonus ?? 2}" min="1" style="width: 60px;" />
                        <span style="font-size: 0.8rem; color: #94a3b8;">Bonus ATK</span>
                        <button class="btn-del-anti" data-idx="${aIdx}" style="background: #dc2626; color: #fff; border: none; padding: 2px 8px; border-radius: 4px; font-size: 0.75rem; cursor: pointer;">✕</button>
                      </div>
                    `).join("")}
                  </div>
                  <div style="display: flex; gap: 8px; margin-top: 10px;">
                    <select id="selectAntiKw" style="flex: 1;">
                      ${OFFICIAL_UNIT_KEYWORDS.map(kw => `<option value="${kw.id}">Anti-${kw.label}</option>`).join("")}
                    </select>
                    <input type="number" id="inputAntiVal" value="2" min="1" style="width: 60px;" />
                    <button id="btnAddAntiTrait" style="background: #0284c7; color: #fff; border: none; padding: 4px 12px; border-radius: 4px; font-size: 0.78rem; font-weight: 700; cursor: pointer;">+ Add Anti Trait</button>
                  </div>
                </div>

                <div id="attackGridContainer"></div>
              </div>
            ` : ''}
          `}
        </div>
      `;

      panel.querySelector("#btnAddAttack")?.addEventListener("click", () => {
        piece.attacks.push({
          id: "atk_" + Math.random().toString(36).substr(2, 5),
          name: "New Attack",
          attackValue: "3",
          manaCost: 0,
          manaType: "Neutral",
          rangeMin: 1,
          rangeMax: 1,
          antiKeywords: [],
          patternGrid: { "4,5": "target" },
          canAdvanceOnCapture: true,
          knockback: 0,
          statusInflicted: "",
          rulesText: ""
        });
        this.activeAtkIdx = piece.attacks.length - 1;
        this.store.save();
        this.renderAttacksTab(panel, piece);
        this.updatePreview();
      });

      panel.querySelectorAll(".attack-tabs-bar .atk-tab-btn").forEach(btn => {
        btn.addEventListener("click", (e) => {
          this.activeAtkIdx = parseInt(e.currentTarget.dataset.idx);
          this.renderAttacksTab(panel, piece);
        });
      });

      if (atk) {
        panel.querySelector("#atkName")?.addEventListener("input", (e) => {
          atk.name = e.target.value;
          this.store.save();
          this.updatePreview();
        });
        panel.querySelector("#atkValue")?.addEventListener("input", (e) => {
          atk.attackValue = e.target.value;
          this.store.save();
          this.updatePreview();
        });

        panel.querySelectorAll(".inp-anti-bonus").forEach(inp => {
          inp.addEventListener("input", (e) => {
            const aIdx = parseInt(e.target.dataset.idx);
            if (atk.antiKeywords && atk.antiKeywords[aIdx]) {
              atk.antiKeywords[aIdx].bonus = parseInt(e.target.value) || 1;
              this.store.save();
              this.updatePreview();
            }
          });
        });

        panel.querySelectorAll(".btn-del-anti").forEach(btn => {
          btn.addEventListener("click", (e) => {
            const aIdx = parseInt(e.currentTarget.dataset.idx);
            if (atk.antiKeywords) {
              atk.antiKeywords.splice(aIdx, 1);
              this.store.save();
              this.renderAttacksTab(panel, piece);
              this.updatePreview();
            }
          });
        });

        panel.querySelector("#btnAddAntiTrait")?.addEventListener("click", () => {
          const kw = panel.querySelector("#selectAntiKw").value;
          const val = parseInt(panel.querySelector("#inputAntiVal").value) || 2;
          atk.antiKeywords = atk.antiKeywords || [];
          if (!atk.antiKeywords.some(a => a.keyword === kw)) {
            atk.antiKeywords.push({ keyword: kw, bonus: val });
            this.store.save();
            this.renderAttacksTab(panel, piece);
            this.updatePreview();
          }
        });

        const atkGridMount = panel.querySelector("#attackGridContainer");
        new GridEditor(atkGridMount, {
          mode: "attack",
          gridMap: atk.patternGrid || {},
          onChange: (newMap) => {
            atk.patternGrid = newMap;
            this.store.save();
            this.updatePreview();
          }
        });
      }
    }

    renderAbilitiesTab(panel, piece) {
      piece.abilities = piece.abilities || [];
      panel.innerHTML = `
        <div class="designer-form-wrapper">
          <h3 class="form-section-title">🌟 Passive & Active Abilities</h3>
          <button class="btn-topbar" id="btnAddAbility">➕ Add Ability</button>
          <div class="abilities-list" id="abilitiesList"></div>
        </div>
      `;

      const abListEl = panel.querySelector("#abilitiesList");
      abListEl.innerHTML = piece.abilities.map((ab, idx) => `
        <div class="ability-edit-card" data-idx="${idx}">
          <input type="text" class="input-ab-name" data-idx="${idx}" value="${escapeAttr(ab.name || '')}" placeholder="Ability Name" />
          <textarea class="txt-ab-text" data-idx="${idx}" placeholder="Ability text...">${escapeHTML(ab.text || ab.effect || '')}</textarea>
        </div>
      `).join("");

      panel.querySelector("#btnAddAbility").addEventListener("click", () => {
        piece.abilities.push({ name: "New Ability", type: "Passive", text: "" });
        this.store.save();
        this.renderAbilitiesTab(panel, piece);
        this.updatePreview();
      });

      abListEl.querySelectorAll(".input-ab-name").forEach(inp => {
        inp.addEventListener("input", (e) => {
          piece.abilities[parseInt(e.target.dataset.idx)].name = e.target.value;
          this.store.save();
          this.updatePreview();
        });
      });

      abListEl.querySelectorAll(".txt-ab-text").forEach(txt => {
        txt.addEventListener("input", (e) => {
          piece.abilities[parseInt(e.target.dataset.idx)].text = e.target.value;
          this.store.save();
          this.updatePreview();
        });
      });
    }

    renderSpecialTab(panel, piece) {
      panel.innerHTML = `
        <div class="designer-form-wrapper">
          <h3 class="form-section-title">📚 Libraries & Mana Storage</h3>
          <div class="form-group checkbox-group-card">
            <label class="checkbox-label">
              <input type="checkbox" id="chkHasLib" ${piece.hasLibrary ? 'checked' : ''} />
              📚 Carries a Library (Stores Spell Cards)
            </label>
          </div>
          <div class="form-group">
            <label>Library Capacity:</label>
            <input type="number" id="libCap" value="${piece.libraryCapacity ?? 0}" min="0" />
          </div>
        </div>
      `;

      panel.querySelector("#chkHasLib").addEventListener("change", (e) => {
        piece.hasLibrary = e.target.checked;
        this.store.save();
        this.updatePreview();
      });

      panel.querySelector("#libCap").addEventListener("input", (e) => {
        piece.libraryCapacity = parseInt(e.target.value) || 0;
        this.store.save();
        this.updatePreview();
      });
    }

    renderNotesTab(panel, piece) {
      panel.innerHTML = `
        <div class="designer-form-wrapper">
          <h3 class="form-section-title">🧪 Prototype Notes</h3>
          <div class="form-group">
            <textarea id="protoNotes" rows="6">${escapeHTML(piece.prototypeNotes || '')}</textarea>
          </div>
        </div>
      `;

      panel.querySelector("#protoNotes").addEventListener("input", (e) => {
        piece.prototypeNotes = e.target.value;
        this.store.save();
      });
    }

    updatePreview() {
      if (this.store.activeCardType === "piece") {
        this.cardPreview.render(this.store.getActivePiece());
      }
    }

    openArmyBuilderModal() {
      const modalDiv = document.createElement("div");
      modalDiv.className = "designer-modal-overlay";
      modalDiv.style.cssText = "position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.8); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 20px;";

      const pieces = this.store.project.pieces;
      const armyConfig = {};
      pieces.forEach(p => {
        armyConfig[p.id] = (p.isKingEquivalent || (p.unitKeywords || []).includes("Sovereign")) ? 1 : 2;
      });

      const updateModalUI = () => {
        let totalPts = 0;
        let hasSovereign = false;

        pieces.forEach(p => {
          const count = armyConfig[p.id] || 0;
          totalPts += (p.pointsCost ?? 0) * count;
          if (count > 0 && (p.isKingEquivalent || (p.unitKeywords || []).includes("Sovereign"))) {
            hasSovereign = true;
          }
        });

        modalDiv.innerHTML = `
          <div class="designer-modal-content" style="background: #1e293b; border: 1px solid rgba(255,255,255,0.15); border-radius: 12px; padding: 24px; max-width: 580px; width: 100%; color: #fff; box-shadow: 0 10px 25px rgba(0,0,0,0.5);">
            <h2 style="font-size: 1.3rem; color: #38bdf8; display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
              🎮 Custom Army / Deck Configurator
            </h2>
            <p style="font-size: 0.8rem; color: #94a3b8; margin-bottom: 16px;">
              Assemble your custom pieces into an Army Set for the Play Game Sandbox!
            </p>

            <div style="margin-bottom: 12px;">
              <label style="font-size: 0.82rem; font-weight: 700; display: block; margin-bottom: 4px;">Army Name:</label>
              <input type="text" id="armyNameInput" value="${escapeAttr(this.store.project.projectInfo.name + ' Army')}" style="width: 100%; padding: 8px; background: #0f172a; border: 1px solid #334155; color: #fff; border-radius: 6px;" />
            </div>

            <div style="max-height: 260px; overflow-y: auto; display: flex; flex-direction: column; gap: 6px; background: #0f172a; padding: 10px; border-radius: 8px; margin-bottom: 16px;">
              ${pieces.map(p => {
                const count = armyConfig[p.id] || 0;
                return `
                  <div style="display: flex; align-items: center; justify-content: space-between; background: rgba(255,255,255,0.04); padding: 6px 12px; border-radius: 6px; font-size: 0.85rem;">
                    <span>
                      ${p.iconUrl ? `<img src="${p.iconUrl}" style="width: 18px; height: 18px; vertical-align: middle; margin-right: 6px;" />` : `<span style="margin-right: 6px;">${p.symbol || '🛡️'}</span>`}
                      <strong>${escapeHTML(p.name)}</strong> (${p.pointsCost ?? 0} pts)
                      ${(p.isKingEquivalent || (p.unitKeywords || []).includes("Sovereign")) ? '<span style="color: #f59e0b; margin-left: 4px;">👑 [Sovereign]</span>' : ''}
                    </span>
                    <div style="display: flex; align-items: center; gap: 8px;">
                      <button class="btn-mod-qty" data-id="${p.id}" data-dir="-1" style="background: #334155; color: #fff; border: none; padding: 2px 8px; border-radius: 4px; cursor: pointer;">-</button>
                      <span style="font-family: monospace; font-weight: 700; width: 24px; text-align: center;">${count}</span>
                      <button class="btn-mod-qty" data-id="${p.id}" data-dir="1" style="background: #334155; color: #fff; border: none; padding: 2px 8px; border-radius: 4px; cursor: pointer;">+</button>
                    </div>
                  </div>
                `;
              }).join("")}
            </div>

            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; background: rgba(0,0,0,0.3); padding: 10px; border-radius: 8px;">
              <div>
                <span style="font-size: 0.85rem; color: #94a3b8;">Total Points:</span>
                <strong style="font-size: 1.1rem; color: #f59e0b; margin-left: 6px;">${totalPts} PTS</strong>
              </div>
              <div>
                ${hasSovereign ? `<span style="color: #34d399; font-size: 0.8rem; font-weight: 700;">✓ Sovereign Included</span>` : `<span style="color: #f87171; font-size: 0.8rem; font-weight: 700;">⚠️ Needs 1 Sovereign</span>`}
              </div>
            </div>

            <div style="display: flex; justify-content: flex-end; gap: 10px;">
              <button id="btnCloseArmyModal" style="background: #475569; color: #fff; border: none; padding: 8px 16px; border-radius: 6px; font-weight: 600; cursor: pointer;">Cancel</button>
              <button id="btnConfirmExportArmy" style="background: #059669; color: #fff; border: none; padding: 8px 16px; border-radius: 6px; font-weight: 700; cursor: pointer;">🚀 Save & Export to Sandbox</button>
            </div>
          </div>
        `;

        modalDiv.querySelectorAll(".btn-mod-qty").forEach(btn => {
          btn.addEventListener("click", (e) => {
            const id = e.currentTarget.dataset.id;
            const dir = parseInt(e.currentTarget.dataset.dir);
            armyConfig[id] = Math.max(0, (armyConfig[id] || 0) + dir);
            updateModalUI();
          });
        });

        modalDiv.querySelector("#btnCloseArmyModal")?.addEventListener("click", () => {
          document.body.removeChild(modalDiv);
        });

        modalDiv.querySelector("#btnConfirmExportArmy")?.addEventListener("click", () => {
          const armyName = modalDiv.querySelector("#armyNameInput").value || "Custom Army";
          const customArmyPayload = {
            name: armyName + ` (${totalPts} pts)`,
            config: armyConfig,
            pieces: this.store.project.pieces,
            spells: this.store.project.spells,
            lands: this.store.project.lands,
            timestamp: Date.now()
          };

          try {
            localStorage.setItem("tile_kings_custom_armies_v1", JSON.stringify(customArmyPayload));
            this.store.save();
            alert(`Success! "${armyName}" saved to Sandbox local storage!\n\nYou can now open the "🎮 Play Game Sandbox" tab to select your custom army and play!`);
            document.body.removeChild(modalDiv);
          } catch(err) {
            alert("Failed to save army to storage: " + err.message);
          }
        });
      };

      document.body.appendChild(modalDiv);
      updateModalUI();
    }
  }

  function escapeAttr(str) {
    if (typeof str !== "string") return "";
    return str.replace(/"/g, "&quot;");
  }

  function escapeHTML(str) {
    if (typeof str !== "string") return "";
    return str.replace(/[&<>'"]/g, tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag));
  }

  // Export to window
  window.TileKingsDesigner = {
    DesignerApp,
    ProjectStore,
    GridEditor,
    ActivationBuilder,
    CardPreview
  };

})(window);
