/**
 * Tile Kings Card & Piece Designer - Data Store & Schema Manager
 */

export const RULES_VERSION = "Tile Kings v0.1 Prototype";
export const CARD_VERSION = "1.0";

export const DEFAULT_STATUS_EFFECTS = [
  { id: "st_stun", name: "Stun", description: "Piece cannot activate during its turn.", isCustom: false },
  { id: "st_haste", name: "Haste", description: "+2 Movement speed this activation.", isCustom: false },
  { id: "st_quicken", name: "Quicken", description: "Gain 1 extra Maneuver option.", isCustom: false },
  { id: "st_empower", name: "Empower", description: "+2 Attack value on next attack.", isCustom: false },
  { id: "st_defended", name: "Defended", description: "+2 Defense against next incoming attack.", isCustom: false },
  { id: "st_frenzy", name: "Frenzy", description: "May perform 1 additional attack block.", isCustom: false },
  { id: "st_immobile", name: "Immobile", description: "Movement reduced to 0.", isCustom: false }
];

export const HEALTH_PRESETS = [
  { name: "Pawn", hp: 2, die: "Binary/Physical", type: "Binary / Physical State" },
  { name: "Bishop", hp: 4, die: "d4", type: "Mounted Die" },
  { name: "Rook", hp: 6, die: "d6", type: "Mounted Die" },
  { name: "Knight", hp: 8, die: "d8", type: "Mounted Die" },
  { name: "Queen", hp: 12, type: "Mounted Die", die: "d12" },
  { name: "King", hp: 20, die: "d20", type: "Mounted Die" }
];

// Helper to create blank piece
export function createBlankPiece(name = "New Piece") {
  const id = "pc_" + Date.now().toString(36) + "_" + Math.random().toString(36).substr(2, 4);
  return {
    id,
    name,
    subtitle: "Unit / Melee",
    faction: "Neutral",
    pointsCost: 4,
    isKingEquivalent: false,
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

export function getDefaultPieces() {
  const pawn = createBlankPiece("Pawn");
  pawn.id = "pc_pawn";
  pawn.subtitle = "Infantry / Light";
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
    patternGrid: { "4,5": "target" },
    canAdvanceOnCapture: true,
    knockback: 0,
    statusInflicted: "",
    rulesText: "Attacks facing space."
  }];

  const bishop = createBlankPiece("Bishop");
  bishop.id = "pc_bishop";
  bishop.subtitle = "Caster / Diagonal";
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
    patternGrid: { "4,4": "target", "3,3": "target", "2,2": "target" },
    canAdvanceOnCapture: false,
    knockback: 0,
    statusInflicted: "",
    rulesText: "Fires along diagonal line of sight up to 3 tiles."
  }];

  const rook = createBlankPiece("Rook");
  rook.id = "pc_rook";
  rook.subtitle = "Fortress / Heavy";
  rook.pointsCost = 5;
  rook.maxHp = 6;
  rook.healthDie = "d6";
  rook.defense = 2;
  rook.movementText = "4 Orthogonal";
  rook.hasLibrary = true;
  rook.libraryCapacity = 2;
  rook.libraryNotes = "Can store up to 2 Spell Cards safely inside its internal vaults.";
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
    patternGrid: { "4,5": "target" },
    canAdvanceOnCapture: true,
    knockback: 1,
    statusInflicted: "",
    rulesText: "Deals 4 damage and knocks the target back 1 tile."
  }];

  const knight = createBlankPiece("Knight");
  knight.id = "pc_knight";
  knight.subtitle = "Cavalry / Charger";
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
    patternGrid: { "4,5": "target", "3,5": "target" },
    canAdvanceOnCapture: true,
    knockback: 0,
    statusInflicted: "",
    rulesText: "Attack Value equals half the tiles moved this activation + 2."
  }];

  const queen = createBlankPiece("Queen");
  queen.id = "pc_queen";
  queen.subtitle = "Commander / Apex";
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
    patternGrid: { "4,5": "target", "4,4": "target", "4,6": "target" },
    canAdvanceOnCapture: true,
    knockback: 0,
    statusInflicted: "",
    rulesText: "Strikes target and adjacent front arc tiles."
  }];

  const king = createBlankPiece("King");
  king.id = "pc_king";
  king.subtitle = "Sovereign / Monarch";
  king.pointsCost = 8;
  king.maxHp = 20;
  king.healthDie = "d20";
  king.isKingEquivalent = true;
  king.defense = 3;
  king.movementText = "2";
  king.description = "The core sovereign of the army. Losing the King loses the game.";
  king.movementGrid = { "4,5": "legal", "4,4": "legal", "4,6": "legal", "6,5": "legal" };
  king.attacks = [{
    id: "atk_king_decree",
    name: "Sovereign Strike",
    attackValue: "4",
    manaCost: 0,
    manaType: "Neutral",
    rangeMin: 1,
    rangeMax: 1,
    patternGrid: { "4,5": "target" },
    canAdvanceOnCapture: false,
    knockback: 0,
    statusInflicted: "",
    rulesText: "Deals 4 damage."
  }];

  return [king, queen, rook, knight, bishop, pawn];
}

export function getDefaultSpells() {
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

export function getDefaultLands() {
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

export class ProjectStore {
  constructor() {
    this.STORAGE_KEY = "tile_kings_project_v1";
    this.project = this.loadProject();
    this.activeCardId = this.project.pieces[0]?.id || null;
    this.activeCardType = "piece"; // "piece", "spell", "land"
  }

  loadProject() {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Basic schema check
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

  updateActivePiece(updatedFields) {
    const piece = this.getActivePiece();
    if (!piece) return;
    Object.assign(piece, updatedFields);
    this.save();
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
