/**
 * Tile Kings - Board Renderer UI Component
 * Renders the 12x12 grid, light/dark neutral grays, elemental tile color blending,
 * piece tokens with facing direction arrows & HP badges, and movement/attack highlights.
 */

import { FACING_ARROWS } from '../engine/gridEngine.js';

export function renderBoard(containerEl, gameState, options = {}) {
  const {
    selectedPieceId,
    legalMoves = [],
    legalAttacks = [],
    onTileClick = () => {},
    onPieceClick = () => {}
  } = options;

  const { boardGrid, piecesMap, phase, activePlayer } = gameState;

  containerEl.innerHTML = '';

  const boardGridEl = document.createElement('div');
  boardGridEl.className = 'board-grid-12x12';

  for (let r = 0; r < 12; r++) {
    for (let c = 0; c < 12; c++) {
      const cellData = boardGrid[r][c];
      const cellEl = document.createElement('div');

      // Light / Dark neutral checkerboard pattern
      const isLightTile = (r + c) % 2 === 0;
      const baseClass = isLightTile ? 'neutral-light' : 'neutral-dark';

      // Elemental tile color blending
      const terrain = cellData.terrain; // 'neutral', 'fire', 'earth', 'water', 'air'
      let terrainClass = baseClass;
      if (terrain !== 'neutral') {
        terrainClass = `${terrain}-${isLightTile ? 'light' : 'dark'}`;
      }

      cellEl.className = `board-cell ${baseClass} ${terrainClass}`;
      cellEl.dataset.x = c;
      cellEl.dataset.y = r;

      // Deployment zone overlays during deployment phase
      if (phase === 'DEPLOYMENT') {
        if (activePlayer === 'white' && r <= 3) {
          cellEl.classList.add('white-deploy-zone');
        } else if (activePlayer === 'black' && r >= 8) {
          cellEl.classList.add('black-deploy-zone');
        }
      }

      // Check if tile is in legal movement list
      const isLegalMove = legalMoves.some(m => m.x === c && m.y === r);
      if (isLegalMove) {
        cellEl.classList.add('legal-move');
      }

      // Check if tile is in legal attack list
      const isLegalAttack = legalAttacks.some(a => a.x === c && a.y === r);
      if (isLegalAttack) {
        cellEl.classList.add('legal-attack');
      }

      // Check if piece occupies tile
      const pieceOnTile = Object.values(piecesMap).find(p => p.x === c && p.y === r && p.hp > 0);

      if (pieceOnTile) {
        const isSelected = selectedPieceId === pieceOnTile.id;
        if (isSelected) {
          cellEl.classList.add('selected-tile');
        }

        const tokenEl = document.createElement('div');
        const isActivated = pieceOnTile.activatedThisTurn;

        tokenEl.className = `piece-token ${pieceOnTile.owner} ${isSelected ? 'selected' : ''} ${isActivated ? 'activated' : ''}`;
        tokenEl.innerText = pieceOnTile.symbol || '♟';

        // Facing direction arrow indicator
        const facingArrowEl = document.createElement('span');
        const facingClass = ['north', 'east', 'south', 'west'][pieceOnTile.facing];
        facingArrowEl.className = `facing-arrow ${facingClass}`;
        facingArrowEl.innerText = FACING_ARROWS[pieceOnTile.facing];
        tokenEl.appendChild(facingArrowEl);

        // HP Badge bar
        const hpBadgeEl = document.createElement('span');
        hpBadgeEl.className = 'hp-badge';
        hpBadgeEl.innerText = `${pieceOnTile.hp}/${pieceOnTile.maxHP}`;
        tokenEl.appendChild(hpBadgeEl);

        tokenEl.addEventListener('click', (e) => {
          e.stopPropagation();
          onPieceClick(pieceOnTile);
        });

        cellEl.appendChild(tokenEl);
      }

      // Cell click handler
      cellEl.addEventListener('click', () => {
        onTileClick(c, r, cellData, pieceOnTile);
      });

      boardGridEl.appendChild(cellEl);
    }
  }

  containerEl.appendChild(boardGridEl);
}
