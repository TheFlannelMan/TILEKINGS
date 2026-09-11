/**
 * Tile Kings - Library Storage Drawer Component
 * Allows storing Spell cards into Library units (e.g. Rook) and retrieving them.
 */

export function renderLibraryDrawer(containerEl, unit, hand, onStoreSpell = () => {}, onRetrieveSpell = () => {}, onClose = () => {}) {
  containerEl.innerHTML = '';

  const modalOverlay = document.createElement('div');
  modalOverlay.className = 'modal-overlay';

  const modalContent = document.createElement('div');
  modalContent.className = 'modal-content';

  const spellsInHand = hand.filter(c => c.type === 'SPELL');
  const storedCards = unit.library || [];
  const capacity = unit.libraryCapacity || 0;

  modalContent.innerHTML = `
    <div style="border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 12px; margin-bottom: 16px;">
      <h2 style="font-size: 1.3rem; font-weight: 800; color: #8b5cf6; display: flex; align-items: center; gap: 8px;">
        📚 ${unit.name} Library Vault (${storedCards.length}/${capacity} Cards)
      </h2>
      <p style="font-size: 0.8rem; color: var(--text-muted); margin-top: 4px;">
        Storing or retrieving a Spell card costs 1 Activation Point (AP). Stored cards do not count toward hand limit.
      </p>
    </div>

    <div style="margin-bottom: 16px;">
      <h3 style="font-size: 0.85rem; text-transform: uppercase; color: var(--accent-purple); margin-bottom: 8px;">
        Currently Stored in Library:
      </h3>
      ${storedCards.length === 0 ? `
        <div style="font-size: 0.8rem; color: var(--text-muted);">Library is empty.</div>
      ` : `
        <div style="display: flex; flex-direction: column; gap: 6px;">
          ${storedCards.map(c => `
            <div style="background: rgba(139, 92, 246, 0.1); border: 1px solid #8b5cf6; padding: 8px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center;">
              <div>
                <strong style="font-size: 0.85rem;">${c.name}</strong>
                <div style="font-size: 0.7rem; color: var(--text-muted);">${c.description}</div>
              </div>
              <button class="btn btn-warning retrieve-btn" data-id="${c.uid}" style="font-size: 0.75rem; padding: 4px 10px;">Retrieve (1 AP)</button>
            </div>
          `).join('')}
        </div>
      `}
    </div>

    <div style="margin-bottom: 16px;">
      <h3 style="font-size: 0.85rem; text-transform: uppercase; color: var(--accent-blue); margin-bottom: 8px;">
        Store Spell from Hand:
      </h3>
      ${storedCards.length >= capacity ? `
        <div style="font-size: 0.8rem; color: #ef4444;">Library vault is full!</div>
      ` : spellsInHand.length === 0 ? `
        <div style="font-size: 0.8rem; color: var(--text-muted);">No Spell cards in hand to store.</div>
      ` : `
        <div style="display: flex; flex-direction: column; gap: 6px;">
          ${spellsInHand.map(s => `
            <div style="background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); padding: 8px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center;">
              <div>
                <strong style="font-size: 0.85rem;">${s.name}</strong>
                <div style="font-size: 0.7rem; color: var(--text-muted);">${s.description}</div>
              </div>
              <button class="btn btn-primary store-btn" data-id="${s.uid}" style="font-size: 0.75rem; padding: 4px 10px;">Store (1 AP)</button>
            </div>
          `).join('')}
        </div>
      `}
    </div>

    <div style="display: flex; justify-content: flex-end; margin-top: 16px;">
      <button class="btn" id="closeLibraryBtn">Close Library</button>
    </div>
  `;

  modalContent.querySelectorAll('.retrieve-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const cardUid = btn.dataset.id;
      onRetrieveSpell(cardUid);
      containerEl.innerHTML = '';
    });
  });

  modalContent.querySelectorAll('.store-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const cardUid = btn.dataset.id;
      onStoreSpell(cardUid);
      containerEl.innerHTML = '';
    });
  });

  modalContent.querySelector('#closeLibraryBtn').addEventListener('click', () => {
    containerEl.innerHTML = '';
    onClose();
  });

  modalOverlay.appendChild(modalContent);
  containerEl.appendChild(modalOverlay);
}
