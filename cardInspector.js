/**
 * Tile Kings - Piece Card Inspector Modal Component
 * Renders the standardized physical board-game piece card view.
 */

import { FACING_NAMES } from '../engine/gridEngine.js';

export function renderPieceCardModal(containerEl, piece, onClose = () => {}) {
  if (!piece) {
    containerEl.innerHTML = '';
    return;
  }

  const modalOverlay = document.createElement('div');
  modalOverlay.className = 'modal-overlay';

  const modalContent = document.createElement('div');
  modalContent.className = 'modal-content';
  modalContent.style.borderTop = `6px solid ${piece.owner === 'white' ? '#38bdf8' : '#c084fc'}`;

  // Card Header
  const headerHtml = `
    <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 12px; margin-bottom: 16px;">
      <div>
        <h2 style="font-size: 1.4rem; font-weight: 800; display: flex; align-items: center; gap: 8px;">
          <span>${piece.symbol}</span> ${piece.name}
        </h2>
        <span style="font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase;">Class: ${piece.type.toUpperCase()} • Facing: ${FACING_NAMES[piece.facing]}</span>
      </div>
      <div style="background: rgba(245, 158, 11, 0.15); border: 1px solid #f59e0b; padding: 6px 14px; border-radius: 20px; font-weight: 700; color: #fbbf24;">
        ${piece.pointCost} PTS
      </div>
    </div>
  `;

  // Core Stats Grid
  const statsHtml = `
    <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 16px; text-align: center;">
      <div style="background: rgba(0,0,0,0.3); padding: 10px; border-radius: 10px; border: 1px solid rgba(239, 68, 68, 0.3);">
        <div style="font-size: 0.75rem; color: var(--text-muted);">HP</div>
        <div style="font-size: 1.3rem; font-weight: 800; color: #f87171;">${piece.hp}/${piece.maxHP}</div>
      </div>
      <div style="background: rgba(0,0,0,0.3); padding: 10px; border-radius: 10px; border: 1px solid rgba(16, 185, 129, 0.3);">
        <div style="font-size: 0.75rem; color: var(--text-muted);">DEFENSE</div>
        <div style="font-size: 1.3rem; font-weight: 800; color: #34d399;">${piece.defense}</div>
      </div>
      <div style="background: rgba(0,0,0,0.3); padding: 10px; border-radius: 10px; border: 1px solid rgba(59, 130, 246, 0.3);">
        <div style="font-size: 0.75rem; color: var(--text-muted);">MOVEMENT</div>
        <div style="font-size: 1.3rem; font-weight: 800; color: #60a5fa;">${piece.movement.maxDistance}</div>
      </div>
      <div style="background: rgba(0,0,0,0.3); padding: 10px; border-radius: 10px; border: 1px solid rgba(168, 85, 247, 0.3);">
        <div style="font-size: 0.75rem; color: var(--text-muted);">MANEUVER</div>
        <div style="font-size: 1.3rem; font-weight: 800; color: #c084fc;">${piece.movement.maneuversPerActivation}</div>
      </div>
    </div>
  `;

  // Movement & Pass-through Permissions
  const movementHtml = `
    <div style="background: rgba(0,0,0,0.2); padding: 12px; border-radius: 10px; margin-bottom: 16px; border: 1px solid rgba(255,255,255,0.05);">
      <h3 style="font-size: 0.85rem; text-transform: uppercase; color: var(--accent-blue); margin-bottom: 6px;">🏃 Movement Rules & Permissions</h3>
      <p style="font-size: 0.85rem; line-height: 1.4; color: var(--text-primary);">
        Pattern: <strong>${piece.movement.type.replace('_', ' ').toUpperCase()}</strong> (Distance: ${piece.movement.maxDistance} tiles relative to facing).
      </p>
      <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 4px; display: flex; gap: 12px;">
        <span>Friendly Pass: ${piece.movement.passthroughFriendly ? '✅ Allowed' : '❌ Blocked'}</span>
        <span>Enemy Pass: ${piece.movement.passthroughEnemy ? '✅ Allowed' : '❌ Blocked'}</span>
      </div>
    </div>
  `;

  // Activation Options
  const activationHtml = `
    <div style="background: rgba(0,0,0,0.2); padding: 12px; border-radius: 10px; margin-bottom: 16px; border: 1px solid rgba(255,255,255,0.05);">
      <h3 style="font-size: 0.85rem; text-transform: uppercase; color: var(--accent-gold); margin-bottom: 6px;">⚡ Activation Sequence Options</h3>
      <ul style="font-size: 0.85rem; padding-left: 20px; color: var(--text-primary);">
        ${(piece.activationSequence || ['MOVE_THEN_ATTACK', 'ATTACK_THEN_MOVE']).map(seq => `<li>${seq.replace(/_/g, ' ')}</li>`).join('')}
      </ul>
    </div>
  `;

  // Attack Profiles
  const attacksHtml = `
    <div style="background: rgba(0,0,0,0.2); padding: 12px; border-radius: 10px; margin-bottom: 16px; border: 1px solid rgba(255,255,255,0.05);">
      <h3 style="font-size: 0.85rem; text-transform: uppercase; color: var(--accent-red); margin-bottom: 8px;">⚔️ Attack Profiles</h3>
      ${(piece.attackProfiles || []).map(atk => `
        <div style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); padding: 10px; border-radius: 8px; margin-bottom: 6px;">
          <div style="display: flex; justify-content: space-between; font-weight: 700; font-size: 0.9rem;">
            <span>${atk.name}</span>
            <span style="color: #f87171;">ATK ${atk.attackValue}</span>
          </div>
          <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 4px;">
            Pattern: ${atk.pattern.replace('_', ' ')} • Range: ${atk.range} tile(s) • Capture Advance: ${atk.captureMovement ? 'Yes' : 'No'} • Knockback: ${atk.knockback || 0}
          </div>
        </div>
      `).join('')}
    </div>
  `;

  // Abilities & Capacities
  const abilitiesHtml = `
    <div style="background: rgba(0,0,0,0.2); padding: 12px; border-radius: 10px; margin-bottom: 16px; border: 1px solid rgba(255,255,255,0.05);">
      <h3 style="font-size: 0.85rem; text-transform: uppercase; color: var(--accent-purple); margin-bottom: 8px;">📜 Abilities & Library Capacity</h3>
      <p style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 6px;">
        Library Capacity: <strong>${piece.libraryCapacity || 0} cards</strong> (Hold: ${piece.library ? piece.library.length : 0}/${piece.libraryCapacity || 0})
      </p>
      ${(piece.abilities || []).map(ab => `
        <div style="font-size: 0.8rem; margin-bottom: 4px;">
          <strong style="color: #c084fc;">${ab.name}:</strong> ${ab.description}
        </div>
      `).join('')}
    </div>
  `;

  modalContent.innerHTML = `
    ${headerHtml}
    ${statsHtml}
    ${movementHtml}
    ${activationHtml}
    ${attacksHtml}
    ${abilitiesHtml}
    <div style="display: flex; justify-content: flex-end; margin-top: 16px;">
      <button class="btn btn-primary" id="closeCardModalBtn">Close Card Rules</button>
    </div>
  `;

  modalOverlay.appendChild(modalContent);
  containerEl.appendChild(modalOverlay);

  document.getElementById('closeCardModalBtn').addEventListener('click', () => {
    containerEl.innerHTML = '';
    onClose();
  });
}
