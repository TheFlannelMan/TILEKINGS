/**
 * Tile Kings - Grid Engine & Spatial Geometry
 * Handles 12x12 grid math, facing direction offsets, pathfinding, and target previews.
 */

export const GRID_SIZE = 12;

export const FACING = {
  NORTH: 0,
  EAST: 1,
  SOUTH: 2,
  WEST: 3
};

export const FACING_NAMES = {
  0: 'North',
  1: 'East',
  2: 'South',
  3: 'West'
};

export const FACING_ARROWS = {
  0: '▲',
  1: '►',
  2: '▼',
  3: '◄'
};

// Absolute direction vectors for N, E, S, W
export const DIRECTION_VECTORS = {
  [FACING.NORTH]: { x: 0, y: -1 },
  [FACING.EAST]:  { x: 1, y: 0 },
  [FACING.SOUTH]: { x: 0, y: 1 },
  [FACING.WEST]:  { x: -1, y: 0 }
};

/**
 * Rotates a facing direction by 90 degrees.
 * @param {number} facing Current facing (0..3)
 * @param {string} rotation 'CW' (clockwise) or 'CCW' (counter-clockwise)
 */
export function rotateFacing(facing, rotation = 'CW') {
  if (rotation === 'CW') {
    return (facing + 1) % 4;
  } else {
    return (facing + 3) % 4;
  }
}

/**
 * Checks if coordinate (x,y) is within 12x12 bounds.
 */
export function isInBounds(x, y) {
  return x >= 0 && x < GRID_SIZE && y >= 0 && y < GRID_SIZE;
}

/**
 * Gets absolute relative direction offset given piece facing.
 * Front is vector(facing). Right is vector((facing+1)%4), etc.
 */
export function getRelativeVectors(facing) {
  const front = DIRECTION_VECTORS[facing];
  const right = DIRECTION_VECTORS[(facing + 1) % 4];
  const back = DIRECTION_VECTORS[(facing + 2) % 4];
  const left = DIRECTION_VECTORS[(facing + 3) % 4];

  return {
    front,
    right,
    back,
    left,
    frontLeft: { x: front.x + left.x, y: front.y + left.y },
    frontRight: { x: front.x + right.x, y: front.y + right.y },
    backLeft: { x: back.x + left.x, y: back.y + left.y },
    backRight: { x: back.x + right.x, y: back.y + right.y }
  };
}

/**
 * Calculates legal movement destination tiles for a piece.
 */
export function getLegalMoves(piece, boardGrid, piecesMap) {
  if (!piece || piece.x === undefined || piece.y === undefined) return [];

  const moves = [];
  const facing = piece.facing;
  const rel = getRelativeVectors(facing);
  const pattern = piece.movement.type;
  const maxDist = piece.movement.maxDistance;
  const passFriendly = piece.movement.passthroughFriendly;
  const passEnemy = piece.movement.passthroughEnemy;

  const isTileBlocked = (x, y) => {
    const occupantKey = Object.keys(piecesMap).find(k => {
      const p = piecesMap[k];
      return p.x === x && p.y === y && p.hp > 0;
    });
    if (!occupantKey) return { blocked: false, friendly: false, enemy: false };

    const p = piecesMap[occupantKey];
    const isFriendly = p.owner === piece.owner;
    return { blocked: true, friendly: isFriendly, enemy: !isFriendly, unit: p };
  };

  if (pattern === 'straight_front') {
    // Pawn style 1-step forward
    let nx = piece.x + rel.front.x;
    let ny = piece.y + rel.front.y;
    if (isInBounds(nx, ny)) {
      const occ = isTileBlocked(nx, ny);
      if (!occ.blocked) {
        moves.push({ x: nx, y: ny });
      }
    }
  } else if (pattern === 'orthogonal') {
    // Rook / Omni orthogonal rays (Front, Back, Left, Right)
    const dirs = [rel.front, rel.right, rel.back, rel.left];
    for (const dir of dirs) {
      for (let dist = 1; dist <= maxDist; dist++) {
        const nx = piece.x + dir.x * dist;
        const ny = piece.y + dir.y * dist;
        if (!isInBounds(nx, ny)) break;

        const occ = isTileBlocked(nx, ny);
        if (!occ.blocked) {
          moves.push({ x: nx, y: ny });
        } else {
          // If occupant exists, can we pass through?
          if ((occ.friendly && passFriendly) || (occ.enemy && passEnemy)) {
            continue;
          } else {
            break; // path blocked
          }
        }
      }
    }
  } else if (pattern === 'diagonal') {
    // Bishop diagonal rays
    const dirs = [rel.frontLeft, rel.frontRight, rel.backLeft, rel.backRight];
    for (const dir of dirs) {
      for (let dist = 1; dist <= maxDist; dist++) {
        const nx = piece.x + dir.x * dist;
        const ny = piece.y + dir.y * dist;
        if (!isInBounds(nx, ny)) break;

        const occ = isTileBlocked(nx, ny);
        if (!occ.blocked) {
          moves.push({ x: nx, y: ny });
        } else {
          if ((occ.friendly && passFriendly) || (occ.enemy && passEnemy)) {
            continue;
          } else {
            break;
          }
        }
      }
    }
  } else if (pattern === 'omni') {
    // Queen / King orthogonal & diagonal rays
    const dirs = [
      rel.front, rel.right, rel.back, rel.left,
      rel.frontLeft, rel.frontRight, rel.backLeft, rel.backRight
    ];
    for (const dir of dirs) {
      for (let dist = 1; dist <= maxDist; dist++) {
        const nx = piece.x + dir.x * dist;
        const ny = piece.y + dir.y * dist;
        if (!isInBounds(nx, ny)) break;

        const occ = isTileBlocked(nx, ny);
        if (!occ.blocked) {
          moves.push({ x: nx, y: ny });
        } else {
          if ((occ.friendly && passFriendly) || (occ.enemy && passEnemy)) {
            continue;
          } else {
            break;
          }
        }
      }
    }
  } else if (pattern === 'l_shape') {
    // Knight L-shape jumps (relative to facing)
    const offsets = [
      { x: rel.front.x * 2 + rel.left.x, y: rel.front.y * 2 + rel.left.y },
      { x: rel.front.x * 2 + rel.right.x, y: rel.front.y * 2 + rel.right.y },
      { x: rel.back.x * 2 + rel.left.x, y: rel.back.y * 2 + rel.left.y },
      { x: rel.back.x * 2 + rel.right.x, y: rel.back.y * 2 + rel.right.y },
      { x: rel.left.x * 2 + rel.front.x, y: rel.left.y * 2 + rel.front.y },
      { x: rel.left.x * 2 + rel.back.x, y: rel.left.y * 2 + rel.back.y },
      { x: rel.right.x * 2 + rel.front.x, y: rel.right.y * 2 + rel.front.y },
      { x: rel.right.x * 2 + rel.back.x, y: rel.right.y * 2 + rel.back.y }
    ];

    for (const off of offsets) {
      const nx = piece.x + off.x;
      const ny = piece.y + off.y;
      if (isInBounds(nx, ny)) {
        const occ = isTileBlocked(nx, ny);
        if (!occ.blocked) {
          moves.push({ x: nx, y: ny });
        }
      }
    }
  }

  return moves;
}

/**
 * Calculates legal attack target tiles for a given attack profile.
 * Remind prompt rule: Intervening pieces DO NOT block attacks by default unless specified.
 */
export function getLegalAttackTargets(piece, attackProfile, piecesMap) {
  if (!piece || !attackProfile) return [];

  const targets = [];
  const facing = piece.facing;
  const rel = getRelativeVectors(facing);
  const pattern = attackProfile.pattern;
  const range = attackProfile.range;

  const getOccupantAt = (x, y) => {
    return Object.values(piecesMap).find(p => p.x === x && p.y === y && p.hp > 0);
  };

  const checkAndAdd = (x, y) => {
    if (!isInBounds(x, y)) return;
    const occ = getOccupantAt(x, y);
    // Standard attack targets enemy pieces
    if (occ && occ.owner !== piece.owner) {
      targets.push({ x, y, targetUnit: occ });
    }
  };

  if (pattern === 'front_line') {
    for (let r = 1; r <= range; r++) {
      const nx = piece.x + rel.front.x * r;
      const ny = piece.y + rel.front.y * r;
      checkAndAdd(nx, ny);
    }
  } else if (pattern === 'front_arc') {
    // Front tile + Front-Left + Front-Right
    const tilesToCheck = [
      { x: piece.x + rel.front.x, y: piece.y + rel.front.y },
      { x: piece.x + rel.frontLeft.x, y: piece.y + rel.frontLeft.y },
      { x: piece.x + rel.frontRight.x, y: piece.y + rel.frontRight.y }
    ];
    tilesToCheck.forEach(t => checkAndAdd(t.x, t.y));
  } else if (pattern === 'diagonal') {
    const dirs = [rel.frontLeft, rel.frontRight, rel.backLeft, rel.backRight];
    for (const dir of dirs) {
      for (let r = 1; r <= range; r++) {
        const nx = piece.x + dir.x * r;
        const ny = piece.y + dir.y * r;
        checkAndAdd(nx, ny);
      }
    }
  } else if (pattern === 'all_surrounding') {
    // Queen style omni range
    for (let dx = -range; dx <= range; dx++) {
      for (let dy = -range; dy <= range; dy++) {
        if (dx === 0 && dy === 0) continue;
        const nx = piece.x + dx;
        const ny = piece.y + dy;
        checkAndAdd(nx, ny);
      }
    }
  }

  return targets;
}
