/**
 * Tile Kings - Live Balance Editor UI Component
 * Allows live tweaking of piece HP, Defense, Point Costs, Movement, Maneuvers, and Attack Values.
 */

import { DEFAULT_PIECES } from '../data/pieces.js';

export function renderBalanceEditor(containerEl, currentPiecesData, onApplyChanges = () => {}, onClose = () => {}) {
  containerEl.innerHTML = '';

  const modalOverlay = document.createElement('div');
  modalOverlay.className = 'modal-overlay';

  const modalContent = document.createElement('div');
  modalContent.className = 'modal-content';
  modalContent.style.maxWidth = '750px';

  let localCopy = JSON.parse(JSON.stringify(currentPiecesData || DEFAULT_PIECES));

  const updateView = () => {
    modalContent.innerHTML = `
      <div style="border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 12px; margin-bottom: 16px;">
        <h2 style="font-size: 1.3rem; font-weight: 800; color: #f59e0b; display: flex; align-items: center; gap: 8px;">
          ⚖️ LIVE BALANCE & DATA EDITOR
        </h2>
        <p style="font-size: 0.8rem; color: var(--text-muted); margin-top: 4px;">
          Tweak unit HP, Defense, Point Costs, and Attack Values in real time for game balancing.
        </p>
      </div>

      <div style="max-height: 420px; overflow-y: auto; padding-right: 8px; display: flex; flex-direction: column; gap: 12px;">
        ${Object.keys(localCopy).map(pKey => {
          const piece = localCopy[pKey];
          return `
            <div style="background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.08); padding: 12px; border-radius: 10px;">
              <div style="font-weight: 700; font-size: 1rem; color: #38bdf8; margin-bottom: 8px; display: flex; justify-content: space-between;">
                <span>${piece.symbol} ${piece.name} (${piece.id})</span>
              </div>

              <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px;">
                <div>
                  <label style="font-size: 0.7rem; color: var(--text-muted);">Points</label>
                  <input type="number" class="bal-input" data-key="${pKey}" data-field="pointCost" value="${piece.pointCost}" style="width: 100%; background: #0f172a; border: 1px solid #334155; color: #fff; padding: 4px; border-radius: 4px;">
                </div>
                <div>
                  <label style="font-size: 0.7rem; color: var(--text-muted);">Max HP</label>
                  <input type="number" class="bal-input" data-key="${pKey}" data-field="maxHP" value="${piece.maxHP}" style="width: 100%; background: #0f172a; border: 1px solid #334155; color: #fff; padding: 4px; border-radius: 4px;">
                </div>
                <div>
                  <label style="font-size: 0.7rem; color: var(--text-muted);">Defense</label>
                  <input type="number" class="bal-input" data-key="${pKey}" data-field="defense" value="${piece.defense}" style="width: 100%; background: #0f172a; border: 1px solid #334155; color: #fff; padding: 4px; border-radius: 4px;">
                </div>
                <div>
                  <label style="font-size: 0.7rem; color: var(--text-muted);">Move Speed</label>
                  <input type="number" class="bal-input" data-key="${pKey}" data-field="maxDistance" value="${piece.movement.maxDistance}" style="width: 100%; background: #0f172a; border: 1px solid #334155; color: #fff; padding: 4px; border-radius: 4px;">
                </div>
                <div>
                  <label style="font-size: 0.7rem; color: var(--text-muted);">Maneuvers</label>
                  <input type="number" class="bal-input" data-key="${pKey}" data-field="maneuversPerActivation" value="${piece.movement.maneuversPerActivation}" style="width: 100%; background: #0f172a; border: 1px solid #334155; color: #fff; padding: 4px; border-radius: 4px;">
                </div>
              </div>

              <div style="margin-top: 8px;">
                <label style="font-size: 0.7rem; color: #ef4444; font-weight: 700;">Attack Value (${piece.attackProfiles[0]?.name || 'Primary Attack'})</label>
                <input type="number" class="bal-atk-input" data-key="${pKey}" value="${piece.attackProfiles[0]?.attackValue || 0}" style="width: 80px; background: #0f172a; border: 1px solid #ef4444; color: #fff; padding: 4px; border-radius: 4px; display: block; margin-top: 2px;">
              </div>
            </div>
          `;
        }).join('')}
      </div>

      <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 20px;">
        <button class="btn btn-danger" id="resetBalBtn">Reset Defaults</button>
        <div style="display: flex; gap: 8px;">
          <button class="btn" id="cancelBalBtn">Cancel</button>
          <button class="btn btn-primary" id="applyBalBtn">Save & Apply Balance</button>
        </div>
      </div>
    `;

    modalContent.querySelectorAll('.bal-input').forEach(input => {
      input.addEventListener('change', (e) => {
        const key = e.target.dataset.key;
        const field = e.target.dataset.field;
        const val = parseInt(e.target.value, 10) || 0;

        if (field === 'maxDistance' || field === 'maneuversPerActivation') {
          localCopy[key].movement[field] = val;
        } else {
          localCopy[key][field] = val;
        }
      });
    });

    modalContent.querySelectorAll('.bal-atk-input').forEach(input => {
      input.addEventListener('change', (e) => {
        const key = e.target.dataset.key;
        const val = parseInt(e.target.value, 10) || 0;
        if (localCopy[key].attackProfiles[0]) {
          localCopy[key].attackProfiles[0].attackValue = val;
        }
      });
    });

    modalContent.querySelector('#resetBalBtn').addEventListener('click', () => {
      localCopy = JSON.parse(JSON.stringify(DEFAULT_PIECES));
      updateView();
    });

    modalContent.querySelector('#cancelBalBtn').addEventListener('click', () => {
      containerEl.innerHTML = '';
      onClose();
    });

    modalContent.querySelector('#applyBalBtn').addEventListener('click', () => {
      onApplyChanges(localCopy);
      containerEl.innerHTML = '';
    });
  };

  updateView();
  modalOverlay.appendChild(modalContent);
  containerEl.appendChild(modalOverlay);
}
