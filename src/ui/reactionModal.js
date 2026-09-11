/**
 * Tile Kings - Reaction Response Window Modal Component
 * Gives defending player 1 response window to commit Earth Mana or Reaction Spells before combat resolves.
 */

export function renderReactionModal(containerEl, combatDecl, defendingPlayer, defenderEarthMana, defenderHand, onResolveReaction = () => {}) {
  containerEl.innerHTML = '';

  const modalOverlay = document.createElement('div');
  modalOverlay.className = 'modal-overlay';

  const modalContent = document.createElement('div');
  modalContent.className = 'modal-content';
  modalContent.style.borderTop = '6px solid #ef4444';

  let spentEarthMana = 0;
  let selectedReactionSpell = null;

  const reactionSpells = defenderHand.filter(c => c.type === 'SPELL' && c.timing === 'REACTION');

  const updateView = () => {
    modalContent.innerHTML = `
      <div style="border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 12px; margin-bottom: 16px;">
        <h2 style="font-size: 1.3rem; font-weight: 800; color: #ef4444; display: flex; align-items: center; gap: 8px;">
          🛡️ DEFENSIVE RESPONSE OPPORTUNITY
        </h2>
        <p style="font-size: 0.85rem; color: var(--text-muted); margin-top: 4px;">
          ${defendingPlayer.toUpperCase()} is targeted by an incoming attack!
        </p>
      </div>

      <div style="background: rgba(0,0,0,0.3); padding: 12px; border-radius: 10px; margin-bottom: 16px; border: 1px solid rgba(255,255,255,0.08);">
        <div style="font-size: 0.9rem; font-weight: 700;">Incoming Attack: ${combatDecl.attackProfile.name}</div>
        <div style="font-size: 1.1rem; color: #f87171; font-weight: 800; margin-top: 4px;">
          Declared Attack Power: ${combatDecl.totalDeclaredAttack} ATK
        </div>
      </div>

      <div style="margin-bottom: 16px;">
        <label style="font-size: 0.85rem; font-weight: 700; display: block; margin-bottom: 6px;">
          🌍 Spend Earth Mana (+1 Defense per 1 Earth Mana spent):
        </label>
        <div style="display: flex; align-items: center; gap: 12px;">
          <button class="btn" id="decEarthBtn" ${spentEarthMana <= 0 ? 'disabled' : ''}>-</button>
          <span style="font-family: 'JetBrains Mono', monospace; font-size: 1.2rem; font-weight: 700;">${spentEarthMana} / ${defenderEarthMana} Earth Mana</span>
          <button class="btn" id="incEarthBtn" ${spentEarthMana >= defenderEarthMana ? 'disabled' : ''}>+</button>
        </div>
      </div>

      <div style="margin-bottom: 16px;">
        <label style="font-size: 0.85rem; font-weight: 700; display: block; margin-bottom: 6px;">
          ✨ Play Defensive Reaction Spell (Optional - 1 Max):
        </label>
        ${reactionSpells.length === 0 ? `
          <div style="font-size: 0.8rem; color: var(--text-muted);">No reaction spells in hand.</div>
        ` : `
          <div style="display: flex; flex-direction: column; gap: 6px;">
            ${reactionSpells.map(s => `
              <div class="mini-card spell reaction-spell-item" data-id="${s.uid}" style="min-height: auto; cursor: pointer; padding: 8px; border: ${selectedReactionSpell && selectedReactionSpell.uid === s.uid ? '2px solid #f59e0b' : '1px solid rgba(255,255,255,0.1)'};">
                <div style="font-weight: 700; font-size: 0.85rem;">${s.name}</div>
                <div style="font-size: 0.75rem; color: var(--text-muted);">${s.description}</div>
              </div>
            `).join('')}
          </div>
        `}
      </div>

      <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px;">
        <button class="btn btn-primary" id="confirmReactionBtn">Confirm Response & Resolve Combat</button>
      </div>
    `;

    // Event listeners
    const decBtn = modalContent.querySelector('#decEarthBtn');
    const incBtn = modalContent.querySelector('#incEarthBtn');
    if (decBtn) {
      decBtn.addEventListener('click', () => {
        if (spentEarthMana > 0) spentEarthMana--;
        updateView();
      });
    }
    if (incBtn) {
      incBtn.addEventListener('click', () => {
        if (spentEarthMana < defenderEarthMana) spentEarthMana++;
        updateView();
      });
    }

    modalContent.querySelectorAll('.reaction-spell-item').forEach(el => {
      el.addEventListener('click', () => {
        const uid = el.dataset.id;
        const found = reactionSpells.find(s => s.uid === uid);
        if (selectedReactionSpell && selectedReactionSpell.uid === uid) {
          selectedReactionSpell = null;
        } else {
          selectedReactionSpell = found;
        }
        updateView();
      });
    });

    modalContent.querySelector('#confirmReactionBtn').addEventListener('click', () => {
      containerEl.innerHTML = '';
      onResolveReaction({
        earthManaSpent: spentEarthMana,
        reactionSpell: selectedReactionSpell
      });
    });
  };

  updateView();
  modalOverlay.appendChild(modalContent);
  containerEl.appendChild(modalOverlay);
}
