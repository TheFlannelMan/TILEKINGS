/**
 * Tile Kings - Master Game State Manager
 * Handles army construction, placement, 4 AP turn loop, hand/library card management, and win conditions.
 */

import { DEFAULT_PIECES } from '../data/pieces.js';
import { DEFAULT_CARDS } from '../data/cards.js';
import { calculateGenerationPhaseMana, evaluateManaStarvation } from './manaEngine.js';

export const GAME_PHASES = {
  ARMY_CONSTRUCTION: 'ARMY_CONSTRUCTION',
  DEPLOYMENT: 'DEPLOYMENT',
  GENERATION_PHASE: 'GENERATION_PHASE',
  PLAYER_TURN: 'PLAYER_TURN',
  ROUND_END: 'ROUND_END',
  GAME_OVER: 'GAME_OVER'
};

export const AP_PER_TURN = 4;
export const MAX_HAND_SIZE = 7;

/**
 * Creates standard 42-point army pieces.
 */
export function createStandardArmy(owner) {
  const pieces = [];
  let idCounter = 1;

  const addPiece = (typeKey, facing, x, y) => {
    const base = DEFAULT_PIECES[typeKey];
    pieces.push({
      id: `${owner}_${typeKey}_${idCounter++}`,
      type: typeKey,
      name: base.name,
      symbol: base.symbol,
      owner,
      pointCost: base.pointCost,
      hp: base.maxHP,
      maxHP: base.maxHP,
      defense: base.defense,
      movement: { ...base.movement },
      facing: facing, // 0=North, 2=South
      x: x,
      y: y,
      activatedThisTurn: false,
      library: [], // Spell cards stored in library
      libraryCapacity: base.libraryCapacity,
      statuses: [],
      attackProfiles: base.attackProfiles.map(a => ({ ...a })),
      abilities: [...base.abilities]
    });
  };

  const isWhite = owner === 'white';
  const defaultFacing = isWhite ? 0 : 2; // White faces North (0), Black faces South (2)

  // Standard Chess Setup: 8 Pawns, 2 Rooks, 2 Knights, 2 Bishops, 1 Queen, 1 King
  const backRowY = isWhite ? 0 : 11;
  const pawnRowY = isWhite ? 1 : 10;

  // Back row
  addPiece('rook', defaultFacing, 0, backRowY);
  addPiece('knight', defaultFacing, 1, backRowY);
  addPiece('bishop', defaultFacing, 2, backRowY);
  addPiece('queen', defaultFacing, 3, backRowY);
  addPiece('king', defaultFacing, 4, backRowY);
  addPiece('bishop', defaultFacing, 5, backRowY);
  addPiece('knight', defaultFacing, 6, backRowY);
  addPiece('rook', defaultFacing, 7, backRowY);

  // Pawn row (8 pawns across cols 0..7)
  for (let c = 0; c < 8; c++) {
    addPiece('pawn', defaultFacing, c, pawnRowY);
  }

  return pieces;
}

/**
 * Shuffles a card deck.
 */
export function createPlayerDeck() {
  // 40 cards total: 20 Land cards and 20 Spell cards
  const deck = DEFAULT_CARDS.map((card, idx) => ({ ...card, uid: `card_${idx}_${Math.random().toString(36).substr(2, 5)}` }));
  // Fisher-Yates shuffle
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

/**
 * Initializes clean state for a new game.
 */
export function createInitialGameState() {
  const whiteDeck = createPlayerDeck();
  const blackDeck = createPlayerDeck();

  // Draw 5 starting cards for each player
  const whiteHand = whiteDeck.splice(0, 5);
  const blackHand = blackDeck.splice(0, 5);

  // Initialize empty 12x12 grid with neutral terrain
  const boardGrid = Array.from({ length: 12 }, (_, r) =>
    Array.from({ length: 12 }, (_, c) => ({
      x: c,
      y: r,
      terrain: 'neutral' // 'neutral', 'fire', 'earth', 'water', 'air'
    }))
  );

  const whitePieces = createStandardArmy('white');
  const blackPieces = createStandardArmy('black');

  const piecesMap = {};
  [...whitePieces, ...blackPieces].forEach(p => {
    piecesMap[p.id] = p;
  });

  return {
    phase: GAME_PHASES.DEPLOYMENT, // Start directly in Deployment or Army Construction
    roundNumber: 1,
    activePlayer: 'white', // White places first
    activationPoints: AP_PER_TURN,
    
    // Deployment state
    deploymentQueue: [...Object.keys(piecesMap)],
    currentDeployPieceId: Object.keys(piecesMap)[0],
    
    // Mana pools
    mana: {
      white: { fire: 0, earth: 0, water: 0, air: 0 },
      black: { fire: 0, earth: 0, water: 0, air: 0 }
    },

    // Starvation counters
    starvation: {
      white: 0,
      black: 0
    },

    // Cards
    decks: {
      white: whiteDeck,
      black: blackDeck
    },
    hands: {
      white: whiteHand,
      black: blackHand
    },

    // Board & Pieces
    boardGrid,
    piecesMap,

    // Audit logs
    combatLogs: ['🎮 Game Started! Deployment Phase initiated.'],
    
    // Win status
    winner: null,
    winReason: null
  };
}
