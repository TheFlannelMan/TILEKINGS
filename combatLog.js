/**
 * Tile Kings - Combat Log Component
 */

export function renderCombatLog(containerEl, logs = []) {
  containerEl.innerHTML = '';

  const logBox = document.createElement('div');
  logBox.className = 'combat-log-box';

  logs.forEach(log => {
    const entry = document.createElement('div');
    entry.className = 'log-entry';
    entry.innerText = log;
    logBox.appendChild(entry);
  });

  // Auto scroll to bottom
  logBox.scrollTop = logBox.scrollHeight;
  containerEl.appendChild(logBox);
}
