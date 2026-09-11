/**
 * Tile Kings - Card Hand & Card Playing UI Component
 */

export function renderCardHand(containerEl, gameState, options = {}) {
  const { onPlayLandCard = () => {}, onCastSpellCard = () => {} } = options;
  const activePlayer = gameState.activePlayer;
  const hand = gameState.hands[activePlayer] || [];

  containerEl.innerHTML = '';

  const handHeader = document.createElement('div');
  handHeader.style.display = 'flex';
  handHeader.style.justifySpaceBetween = 'space-between';
  handHeader.style.alignItems = 'center';
  handHeader.style.marginBottom = '8px';

  handHeader.innerHTML = `
    <span style="font-weight: 700; font-size: 0.85rem; text-transform: uppercase; color: var(--text-muted);">
      🎴 ${activePlayer.toUpperCase()}'S HAND (${hand.length}/7 CARDS)
    </span>
  `;

  containerEl.appendChild(handHeader);

  const cardListEl = document.createElement('div');
  cardListEl.className = 'card-hand-bar';

  if (hand.length === 0) {
    cardListEl.innerHTML = `<div style="font-size: 0.8rem; color: var(--text-muted); padding: 12px;">Hand is empty. Activate King (1 AP) to draw!</div>`;
  } else {
    hand.forEach(card => {
      const miniCard = document.createElement('div');
      miniCard.className = `mini-card ${card.type.toLowerCase()}`;

      const typeBadge = card.type === 'LAND' ? `🌍 Land (${card.element.toUpperCase()})` : `✨ Spell (${card.timing})`;
      
      miniCard.innerHTML = `
        <div>
          <div class="mini-card-title">${card.name}</div>
          <div style="font-size: 0.65rem; color: var(--text-muted); margin-top: 2px;">${typeBadge}</div>
        </div>
        <div style="font-size: 0.65rem; color: var(--text-muted); margin-top: 4px; line-height: 1.2;">
          ${card.description}
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 6px;">
          <span class="mini-card-cost">${card.apCost} AP</span>
          <button class="btn btn-primary play-card-btn" style="padding: 2px 8px; font-size: 0.7rem;">Play</button>
        </div>
      `;

      miniCard.querySelector('.play-card-btn').addEventListener('click', () => {
        if (card.type === 'LAND') {
          onPlayLandCard(card);
        } else {
          onCastSpellCard(card);
        }
      });

      cardListEl.appendChild(miniCard);
    });
  }

  containerEl.appendChild(cardListEl);
}
