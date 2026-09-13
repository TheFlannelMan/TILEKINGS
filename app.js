/**
 * Tile Kings - Master Application Controller (v0.4)
 * Features:
 * 1. Interactive Multi-Tile Land Placement Engine (Base tile selection + connected orthogonal tile expansion).
 * 2. Land Placement Progress Banner with Undo & Cancel support.
 * 3. Lightning Mode (Instant Sandbox) & Alternating Deployment.
 * 4. Rank & File Notation Labels & Non-overlapping Badges.
 * 5. BroadcastChannel real-time multi-window sync.
 */

// ==========================================================================
// 1. GAME DATA CATALOGS
// ==========================================================================

const DEFAULT_PIECES = {
  pawn: { id: 'pawn', name: 'Pawn', symbol: '♟', pointCost: 1, maxHP: 2, defense: 1, movement: { type: 'straight_front', maxDistance: 1, maneuversPerActivation: 1, passthroughFriendly: false, passthroughEnemy: false }, activationSequence: ['MOVE_THEN_ATTACK', 'ATTACK_THEN_MOVE'], libraryCapacity: 0, attackProfiles: [{ id: 'pawn_thrust', name: 'Thrust', pattern: 'front_line', range: 1, attackValue: 3, captureMovement: true, knockback: 0 }], abilities: [{ name: 'Infantry Wall', description: 'Gains +1 Defense when adjacent to another Pawn.' }] },
  bishop: { id: 'bishop', name: 'Bishop', symbol: '♝', pointCost: 2, maxHP: 4, defense: 1, movement: { type: 'diagonal', maxDistance: 3, maneuversPerActivation: 1, passthroughFriendly: false, passthroughEnemy: false }, activationSequence: ['MOVE_THEN_ATTACK', 'ATTACK_THEN_MOVE'], libraryCapacity: 0, attackProfiles: [{ id: 'bishop_smite', name: 'Diagonal Smite', pattern: 'diagonal', range: 3, attackValue: 4, captureMovement: false, knockback: 0 }], abilities: [{ name: 'Sanctuary', description: 'Standing on Water terrain increases spell defense.' }] },
  rook: { id: 'rook', name: 'Rook', symbol: '♜', pointCost: 3, maxHP: 6, defense: 2, movement: { type: 'orthogonal', maxDistance: 4, maneuversPerActivation: 1, passthroughFriendly: false, passthroughEnemy: false }, activationSequence: ['MOVE_THEN_ATTACK', 'ATTACK_THEN_MOVE'], libraryCapacity: 2, attackProfiles: [{ id: 'rook_charge', name: 'Heavy Charge', pattern: 'front_line', range: 2, attackValue: 6, captureMovement: true, knockback: 1 }], abilities: [{ name: 'Library Vault', description: 'Can store up to 2 Spell cards.' }] },
  knight: { id: 'knight', name: 'Knight', symbol: '♞', pointCost: 4, maxHP: 8, defense: 2, movement: { type: 'l_shape', maxDistance: 3, maneuversPerActivation: 2, passthroughFriendly: true, passthroughEnemy: true }, activationSequence: ['MANEUVER_MOVE_ATTACK', 'MOVE_THEN_ATTACK'], libraryCapacity: 0, attackProfiles: [{ id: 'knight_cleave', name: 'Flank Cleave', pattern: 'front_arc', range: 1, attackValue: 5, captureMovement: true, knockback: 0 }], abilities: [{ name: 'Leap', description: 'Can pass over both friendly and enemy pieces.' }] },
  queen: { id: 'queen', name: 'Queen', symbol: '♛', pointCost: 6, maxHP: 12, defense: 3, movement: { type: 'omni', maxDistance: 5, maneuversPerActivation: 2, passthroughFriendly: false, passthroughEnemy: false }, activationSequence: ['MOVE_THEN_ATTACK', 'MANEUVER_MOVE_ATTACK'], libraryCapacity: 1, attackProfiles: [{ id: 'queen_burst', name: 'Arcane Burst', pattern: 'all_surrounding', range: 3, attackValue: 8, captureMovement: false, knockback: 0 }], abilities: [{ name: 'Sovereign Presence', description: 'Stores 1 Mana across rounds.' }] },
  king: { id: 'king', name: 'King', symbol: '♚', pointCost: 10, maxHP: 20, defense: 3, movement: { type: 'omni', maxDistance: 1, maneuversPerActivation: 2, passthroughFriendly: false, passthroughEnemy: false }, activationSequence: ['MOVE_THEN_ATTACK', 'KING_DRAW'], libraryCapacity: 0, attackProfiles: [{ id: 'king_decree', name: 'Royal Decree', pattern: 'front_arc', range: 1, attackValue: 5, captureMovement: true, knockback: 0 }], abilities: [{ name: 'King Draw', description: 'Spend 1 AP to draw 1 card.' }, { name: 'Royal Crown', description: 'Primary victory target (Regicide).' }] }
};

const DEFAULT_CARDS = [
  { id: 'l_f4', name: 'Infernal Spire (Fire 4)', type: 'LAND', element: 'fire', tileCount: 4, apCost: 1, description: 'Converts 4 connected tiles to Fire terrain.' },
  { id: 'l_f6', name: 'Volcanic Eruption (Fire 6)', type: 'LAND', element: 'fire', tileCount: 6, apCost: 1, description: 'Converts 6 connected tiles to Fire terrain.' },
  { id: 'l_e4', name: 'Stone Bastion (Earth 4)', type: 'LAND', element: 'earth', tileCount: 4, apCost: 1, description: 'Converts 4 connected tiles to Earth terrain.' },
  { id: 'l_e6', name: 'Crag Formation (Earth 6)', type: 'LAND', element: 'earth', tileCount: 6, apCost: 1, description: 'Converts 6 connected tiles to Earth terrain.' },
  { id: 'l_w4', name: 'Tidal Pool (Water 4)', type: 'LAND', element: 'water', tileCount: 4, apCost: 1, description: 'Converts 4 connected tiles to Water terrain.' },
  { id: 'l_w6', name: 'Glacial Rift (Water 6)', type: 'LAND', element: 'water', tileCount: 6, apCost: 1, description: 'Converts 6 connected tiles to Water terrain.' },
  { id: 'l_a4', name: 'Gale Valley (Air 4)', type: 'LAND', element: 'air', tileCount: 4, apCost: 1, description: 'Converts 4 connected tiles to Air terrain.' },
  { id: 'l_a6', name: 'Cyclone Ridge (Air 6)', type: 'LAND', element: 'air', tileCount: 6, apCost: 1, description: 'Converts 6 connected tiles to Air terrain.' },
  { id: 's_e_aegis', name: 'Earthen Aegis', type: 'SPELL', timing: 'REACTION', apCost: 0, effect: { type: 'BUFF_DEFENSE', amount: 3 }, description: '[Reaction] Adds +3 Defense to defending unit.' },
  { id: 's_gale_def', name: 'Gale Deflection', type: 'SPELL', timing: 'REACTION', apCost: 0, effect: { type: 'REDUCE_ATTACK', amount: 2 }, description: '[Reaction] Reduces incoming attack power by 2.' },
  { id: 's_f_infusion', name: 'Flame Infusion', type: 'SPELL', timing: 'OWN_TURN', apCost: 1, effect: { type: 'BUFF_ATTACK', amount: 3 }, description: '[Own Turn] Adds +3 Attack to your active unit.' },
  { id: 's_spring', name: 'Spring Renewal', type: 'SPELL', timing: 'OWN_TURN', apCost: 1, effect: { type: 'HEAL_HP', amount: 4 }, description: '[Own Turn] Restores 4 HP to a friendly unit.' }
];

const ARMY_PRESETS = {
  standard: { name: 'Standard Chess Army (42 pts)', config: { pawn: 8, bishop: 2, rook: 2, knight: 2, queen: 1, king: 1 } },
  cavalry: { name: 'Cavalry Strike (45 pts)', config: { pawn: 4, bishop: 0, rook: 2, knight: 4, queen: 2, king: 1 } },
  fortress: { name: 'Fortress Wall (48 pts)', config: { pawn: 6, bishop: 2, rook: 4, knight: 0, queen: 1, king: 1 } },
  swarm: { name: 'Infantry Swarm (35 pts)', config: { pawn: 12, bishop: 2, rook: 1, knight: 1, queen: 0, king: 1 } }
};

const FILES = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];
const RANKS = ['12', '11', '10', '9', '8', '7', '6', '5', '4', '3', '2', '1'];

const FACING_ARROWS = { 0: '▲', 1: '►', 2: '▼', 3: '◄' };
const FACING_NAMES = { 0: 'North (UP)', 1: 'East (RIGHT)', 2: 'South (DOWN)', 3: 'West (LEFT)' };

// ==========================================================================
// 2. BROADCAST CHANNEL & GLOBAL STATE
// ==========================================================================

const broadcastChannel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('tile_kings_sync') : null;

let appState = {
  screen: 'HOME_MENU',
  lobby: {
    code: '',
    pointsBudget: 42,
    p1Color: 'white',
    p2Color: 'black',
    whiteReady: false,
    blackReady: false,
    whiteArmyConfig: { pawn: 8, bishop: 2, rook: 2, knight: 2, queen: 1, king: 1 },
    blackArmyConfig: { pawn: 8, bishop: 2, rook: 2, knight: 2, queen: 1, king: 1 }
  },
  game: null,
  selectedPieceId: null,
  selectedReserveType: null,
  pendingLandPlacement: null, // { card, targetCount, element, placedTiles: [{x, y, oldTerrain}] }
  customPiecesData: JSON.parse(JSON.stringify(DEFAULT_PIECES))
};

function broadcastStateUpdate() {
  if (broadcastChannel) {
    broadcastChannel.postMessage({ type: 'STATE_UPDATE', state: appState });
  }

  // Network Sync for multi-device play (LAN & Internet)
  if (window.location.protocol.startsWith('http')) {
    const code = appState.lobby.code || 'GLOBAL';
    fetch('/api/sync?code=' + encodeURIComponent(code), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ state: appState, timestamp: Date.now() })
    }).catch(function() {});
  }
}

if (broadcastChannel) {
  broadcastChannel.onmessage = (event) => {
    if (event.data && event.data.state) {
      appState = event.data.state;
      if (appState.screen === 'HOME_MENU') renderHomeScreen();
      else if (appState.screen === 'LOBBY_ROOM') renderLobbyScreen();
      else if (appState.screen === 'GAME_BOARD') updateBoardUI();
    }
  };
}

// Background Network Sync Polling for multi-device play (LAN & Internet)
if (window.location.protocol.startsWith('http')) {
  setInterval(function() {
    const code = appState.lobby.code || 'GLOBAL';
    fetch('/api/sync?code=' + encodeURIComponent(code))
      .then(function(res) { return res.json(); })
      .then(function(data) {
        if (data && data.state) {
          const incomingJson = JSON.stringify(data.state);
          const currentJson = JSON.stringify(appState);
          if (incomingJson !== currentJson) {
            appState = data.state;
            if (appState.screen === 'HOME_MENU') renderHomeScreen();
            else if (appState.screen === 'LOBBY_ROOM') renderLobbyScreen();
            else if (appState.screen === 'GAME_BOARD') updateBoardUI();
          }
        }
      }).catch(function() {});
  }, 1000);
}

// ==========================================================================
// 3. HOME MENU & LOBBY SYSTEM
// ==========================================================================

function generateLobbyCode() { return 'TK-' + Math.floor(1000 + Math.random() * 9000); }

function calculateArmyMetrics(config) {
  let pts = 0, hp = 0, atk = 0;
  for (const k in config) {
    const p = appState.customPiecesData[k];
    if (p) {
      const cnt = config[k];
      pts += cnt * p.pointCost;
      hp += cnt * p.maxHP;
      atk += cnt * (p.attackProfiles[0] ? p.attackProfiles[0].attackValue : 0);
    }
  }
  return { pts, hp, atk };
}

function renderHomeScreen() {
  const container = document.getElementById('appContainer');
  container.innerHTML = `
    <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; background: radial-gradient(circle at center, #1e293b, #0f172a); padding: 20px;">
      <div style="background: rgba(30, 41, 59, 0.9); border: 1px solid rgba(255,255,255,0.1); border-radius: 20px; padding: 40px; max-width: 560px; width: 100%; text-align: center; box-shadow: 0 20px 40px rgba(0,0,0,0.8);">
        <div style="font-size: 3.5rem; margin-bottom: 8px;">👑</div>
        <h1 style="font-size: 2.3rem; font-weight: 800; background: linear-gradient(135deg, #f59e0b, #ec4899); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 8px;">
          TILE KINGS
        </h1>
        <p style="font-size: 0.95rem; color: var(--text-muted); margin-bottom: 26px;">
          Tactical Turn-Based Skirmish Game on a 12x12 Grid
        </p>

        <div style="display: flex; flex-direction: column; gap: 12px;">
          <button id="lightningModeBtn" class="btn btn-warning" style="padding: 14px; font-size: 1.1rem; justify-content: center; font-weight: 800; box-shadow: 0 0 15px rgba(245, 158, 11, 0.5);">
            ⚡ LIGHTNING MODE (INSTANT SANDBOX)
          </button>
          
          <button id="createLobbyBtn" class="btn btn-primary" style="padding: 12px; font-size: 1rem; justify-content: center;">
            🏰 Create Match Lobby
          </button>
          
          <div style="display: flex; gap: 10px; margin-top: 4px;">
            <input type="text" id="joinCodeInput" placeholder="Enter Lobby Code (e.g. TK-4921)" style="flex: 1; background: #0f172a; border: 1px solid #334155; color: #fff; padding: 10px; border-radius: 8px; font-family: 'JetBrains Mono', monospace; font-size: 0.95rem; text-transform: uppercase;">
            <button id="joinLobbyBtn" class="btn" style="padding: 10px 18px;">Join</button>
          </div>

          <button id="quickPlayBtn" class="btn" style="padding: 10px; justify-content: center; background: rgba(255,255,255,0.05); font-size: 0.85rem;">
            🎯 Standard Match (With Deployment Phase)
          </button>
        </div>
      </div>
    </div>
  `;

  document.getElementById('lightningModeBtn').addEventListener('click', () => {
    startLightningMatch();
  });

  document.getElementById('createLobbyBtn').addEventListener('click', () => {
    appState.lobby.code = generateLobbyCode();
    appState.screen = 'LOBBY_ROOM';
    broadcastStateUpdate();
    renderLobbyScreen();
  });

  document.getElementById('joinLobbyBtn').addEventListener('click', () => {
    const inputVal = document.getElementById('joinCodeInput').value.trim().toUpperCase();
    if (inputVal.length >= 4) {
      appState.lobby.code = inputVal.startsWith('TK-') ? inputVal : `TK-${inputVal}`;
      appState.screen = 'LOBBY_ROOM';
      broadcastStateUpdate();
      renderLobbyScreen();
    } else {
      alert('Please enter a valid 4-6 character Lobby Code.');
    }
  });

  document.getElementById('quickPlayBtn').addEventListener('click', () => {
    startMatchFromLobby();
  });
}

function renderLobbyScreen() {
  const container = document.getElementById('appContainer');
  const lobby = appState.lobby;

  const wMetrics = calculateArmyMetrics(lobby.whiteArmyConfig);
  const bMetrics = calculateArmyMetrics(lobby.blackArmyConfig);

  const p1IsWhite = lobby.p1Color === 'white';

  container.innerHTML = `
    <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; background: radial-gradient(circle at center, #1e293b, #0f172a); padding: 20px;">
      <div style="background: rgba(30, 41, 59, 0.95); border: 1px solid rgba(255,255,255,0.1); border-radius: 20px; padding: 30px; max-width: 950px; width: 100%; box-shadow: 0 20px 40px rgba(0,0,0,0.8);">
        
        <!-- Header Banner & Multi-Window Sync Link -->
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 16px; margin-bottom: 20px;">
          <div>
            <h2 style="font-size: 1.6rem; font-weight: 800; color: #f59e0b;">MATCH LOBBY ROOM</h2>
            <div style="font-size: 0.85rem; color: var(--text-muted);">Assign Player Colors, Presets & Army Construction</div>
          </div>

          <div style="display: flex; align-items: center; gap: 10px;">
            <button id="lobbyLightningBtn" class="btn btn-warning" style="font-size: 0.85rem;" title="Start Instant Pre-Deployed Sandbox">
              ⚡ Lightning Sandbox
            </button>
            <button id="openSecondWindowBtn" class="btn" style="background: rgba(59, 130, 246, 0.2); border-color: #3b82f6; color: #60a5fa;" title="Open second browser window to play Player 2 locally">
              ⚡ Open Player 2 Browser Window
            </button>
            <div style="background: rgba(0,0,0,0.4); border: 1px solid #f59e0b; padding: 10px 16px; border-radius: 12px; font-family: 'JetBrains Mono', monospace; font-size: 1.1rem; font-weight: 800; color: #fbbf24; display: flex; align-items: center; gap: 8px;">
              <span>${lobby.code}</span>
              <button id="copyCodeBtn" style="background: none; border: none; color: #fff; cursor: pointer;" title="Copy Code">📋</button>
            </div>
          </div>
        </div>

        <!-- Side Selector & Points Budget -->
        <div style="background: rgba(0,0,0,0.25); padding: 14px; border-radius: 12px; margin-bottom: 20px; display: flex; align-items: center; justify-content: space-between; border: 1px solid rgba(255,255,255,0.05);">
          <!-- Side Swap Control -->
          <div style="display: flex; align-items: center; gap: 12px;">
            <span style="font-weight: 700; font-size: 0.9rem;">Player Colors:</span>
            <div style="background: rgba(255,255,255,0.05); padding: 6px 12px; border-radius: 8px; font-size: 0.85rem; display: flex; align-items: center; gap: 8px;">
              <span>Player 1: <strong>${p1IsWhite ? '⚪ White' : '⚫ Black'}</strong></span>
              <span>•</span>
              <span>Player 2: <strong>${p1IsWhite ? '⚫ Black' : '⚪ White'}</strong></span>
            </div>
            <button id="swapSidesBtn" class="btn btn-warning" style="padding: 4px 12px; font-size: 0.8rem;">
              ⇄ Swap Sides
            </button>
          </div>

          <!-- Points Budget Control -->
          <div style="display: flex; align-items: center; gap: 10px;">
            <span style="font-weight: 700; font-size: 0.9rem;">Budget:</span>
            <button id="decPointsBtn" class="btn" style="padding: 2px 10px;">-5</button>
            <span style="font-family: 'JetBrains Mono', monospace; font-size: 1.2rem; font-weight: 800; color: #38bdf8;">${lobby.pointsBudget} PTS</span>
            <button id="incPointsBtn" class="btn" style="padding: 2px 10px;">+5</button>
          </div>
        </div>

        <!-- Player Armies Columns -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 24px;">
          
          <!-- White Player Column -->
          <div style="background: rgba(56, 189, 248, 0.05); border: 1px solid rgba(56, 189, 248, 0.3); padding: 20px; border-radius: 14px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <h3 style="font-size: 1.1rem; font-weight: 800; color: #38bdf8;">⚪ WHITE ARMY (${p1IsWhite ? 'Player 1' : 'Player 2'})</h3>
              <span style="font-family: 'JetBrains Mono', monospace; font-size: 0.9rem; font-weight: 700; color: ${wMetrics.pts <= lobby.pointsBudget ? '#34d399' : '#ef4444'};">
                ${wMetrics.pts} / ${lobby.pointsBudget} PTS
              </span>
            </div>
            
            <div style="font-size: 0.75rem; color: var(--text-muted); margin-bottom: 12px; display: flex; gap: 12px;">
              <span>Total HP: <strong style="color:#fff;">${wMetrics.hp}</strong></span>
              <span>Total ATK: <strong style="color:#fff;">${wMetrics.atk}</strong></span>
            </div>

            <!-- Presets dropdown -->
            <div style="margin-bottom: 12px;">
              <select class="army-preset-select" data-player="white" style="width: 100%; background: #0f172a; border: 1px solid #334155; color: #fff; padding: 6px; border-radius: 6px; font-size: 0.8rem;">
                <option value="">-- Select Army Preset Template --</option>
                ${Object.keys(ARMY_PRESETS).map(k => `<option value="${k}">${ARMY_PRESETS[k].name}</option>`).join('')}
              </select>
            </div>

            ${renderArmyBuilderControls('white', lobby.whiteArmyConfig)}
            
            <button id="readyWhiteBtn" class="btn ${lobby.whiteReady ? 'btn-primary' : ''}" style="width: 100%; margin-top: 14px; justify-content: center;">
              ${lobby.whiteReady ? '✅ White Ready & Agreed' : 'Click to Set White Ready'}
            </button>
          </div>

          <!-- Black Player Column -->
          <div style="background: rgba(192, 132, 252, 0.05); border: 1px solid rgba(192, 132, 252, 0.3); padding: 20px; border-radius: 14px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <h3 style="font-size: 1.1rem; font-weight: 800; color: #c084fc;">⚫ BLACK ARMY (${!p1IsWhite ? 'Player 1' : 'Player 2'})</h3>
              <span style="font-family: 'JetBrains Mono', monospace; font-size: 0.9rem; font-weight: 700; color: ${bMetrics.pts <= lobby.pointsBudget ? '#34d399' : '#ef4444'};">
                ${bMetrics.pts} / ${lobby.pointsBudget} PTS
              </span>
            </div>

            <div style="font-size: 0.75rem; color: var(--text-muted); margin-bottom: 12px; display: flex; gap: 12px;">
              <span>Total HP: <strong style="color:#fff;">${bMetrics.hp}</strong></span>
              <span>Total ATK: <strong style="color:#fff;">${bMetrics.atk}</strong></span>
            </div>

            <div style="margin-bottom: 12px;">
              <select class="army-preset-select" data-player="black" style="width: 100%; background: #0f172a; border: 1px solid #334155; color: #fff; padding: 6px; border-radius: 6px; font-size: 0.8rem;">
                <option value="">-- Select Army Preset Template --</option>
                ${Object.keys(ARMY_PRESETS).map(k => `<option value="${k}">${ARMY_PRESETS[k].name}</option>`).join('')}
              </select>
            </div>

            ${renderArmyBuilderControls('black', lobby.blackArmyConfig)}

            <button id="readyBlackBtn" class="btn ${lobby.blackReady ? 'btn-primary' : ''}" style="width: 100%; margin-top: 14px; justify-content: center;">
              ${lobby.blackReady ? '✅ Black Ready & Agreed' : 'Click to Set Black Ready'}
            </button>
          </div>

        </div>

        <!-- Start Match Controls -->
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <button id="backHomeBtn" class="btn">← Back to Menu</button>
          <button id="startMatchBtn" class="btn btn-warning" style="padding: 12px 30px; font-size: 1.1rem;" ${(!lobby.whiteReady || !lobby.blackReady || wMetrics.pts > lobby.pointsBudget || bMetrics.pts > lobby.pointsBudget) ? 'disabled' : ''}>
            🚀 START MATCH NOW
          </button>
        </div>

      </div>
    </div>
  `;

  // Bind Lobby Events
  document.getElementById('copyCodeBtn').addEventListener('click', () => {
    navigator.clipboard.writeText(lobby.code);
    alert(`Lobby Code ${lobby.code} copied to clipboard!`);
  });

  document.getElementById('lobbyLightningBtn').addEventListener('click', () => {
    startLightningMatch();
  });

  document.getElementById('openSecondWindowBtn').addEventListener('click', () => {
    window.open(window.location.href, '_blank');
  });

  document.getElementById('swapSidesBtn').addEventListener('click', () => {
    const temp = lobby.p1Color;
    lobby.p1Color = lobby.p2Color;
    lobby.p2Color = temp;
    broadcastStateUpdate();
    renderLobbyScreen();
  });

  document.getElementById('decPointsBtn').addEventListener('click', () => {
    if (lobby.pointsBudget > 10) lobby.pointsBudget -= 5;
    broadcastStateUpdate();
    renderLobbyScreen();
  });

  document.getElementById('incPointsBtn').addEventListener('click', () => {
    lobby.pointsBudget += 5;
    broadcastStateUpdate();
    renderLobbyScreen();
  });

  container.querySelectorAll('.army-preset-select').forEach(sel => {
    sel.addEventListener('change', (e) => {
      const p = e.target.dataset.player;
      const key = e.target.value;
      if (key && ARMY_PRESETS[key]) {
        if (p === 'white') lobby.whiteArmyConfig = { ...ARMY_PRESETS[key].config };
        else lobby.blackArmyConfig = { ...ARMY_PRESETS[key].config };
        broadcastStateUpdate();
        renderLobbyScreen();
      }
    });
  });

  bindArmyBuilderEvents('white');
  bindArmyBuilderEvents('black');

  document.getElementById('readyWhiteBtn').addEventListener('click', () => {
    lobby.whiteReady = !lobby.whiteReady;
    broadcastStateUpdate();
    renderLobbyScreen();
  });

  document.getElementById('readyBlackBtn').addEventListener('click', () => {
    lobby.blackReady = !lobby.blackReady;
    broadcastStateUpdate();
    renderLobbyScreen();
  });

  document.getElementById('backHomeBtn').addEventListener('click', () => {
    appState.screen = 'HOME_MENU';
    broadcastStateUpdate();
    renderHomeScreen();
  });

  document.getElementById('startMatchBtn').addEventListener('click', () => {
    startMatchFromLobby();
  });
}

function renderArmyBuilderControls(player, config) {
  const pieces = appState.customPiecesData;
  return `
    <div style="display: flex; flex-direction: column; gap: 6px;">
      ${Object.keys(pieces).map(typeKey => {
        const p = pieces[typeKey];
        const count = config[typeKey] || 0;
        return `
          <div style="background: rgba(0,0,0,0.3); padding: 6px 12px; border-radius: 8px; display: flex; align-items: center; justify-content: space-between; font-size: 0.85rem;">
            <span>${p.symbol} <strong>${p.name}</strong> (${p.pointCost} pts)</span>
            <div style="display: flex; align-items: center; gap: 8px;">
              <button class="btn dec-piece-btn" data-player="${player}" data-type="${typeKey}" style="padding: 2px 8px; font-size: 0.75rem;">-</button>
              <span style="font-family: 'JetBrains Mono', monospace; font-weight: 700; width: 20px; text-align: center;">${count}</span>
              <button class="btn inc-piece-btn" data-player="${player}" data-type="${typeKey}" style="padding: 2px 8px; font-size: 0.75rem;">+</button>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

function bindArmyBuilderEvents(player) {
  const container = document.getElementById('appContainer');
  container.querySelectorAll(`.dec-piece-btn[data-player="${player}"]`).forEach(btn => {
    btn.addEventListener('click', () => {
      const type = btn.dataset.type;
      const config = player === 'white' ? appState.lobby.whiteArmyConfig : appState.lobby.blackArmyConfig;
      if (type === 'king' && config[type] <= 1) return;
      if (config[type] > 0) {
        config[type]--;
        broadcastStateUpdate();
        renderLobbyScreen();
      }
    });
  });

  container.querySelectorAll(`.inc-piece-btn[data-player="${player}"]`).forEach(btn => {
    btn.addEventListener('click', () => {
      const type = btn.dataset.type;
      const config = player === 'white' ? appState.lobby.whiteArmyConfig : appState.lobby.blackArmyConfig;
      config[type] = (config[type] || 0) + 1;
      broadcastStateUpdate();
      renderLobbyScreen();
    });
  });
}

function buildCustomArmyPieces(owner, config) {
  const pieces = [];
  let idCounter = 1;
  const isWhite = owner === 'white';
  const defaultFacing = isWhite ? 0 : 2; // North for White, South for Black

  for (const typeKey in config) {
    const count = config[typeKey];
    const base = appState.customPiecesData[typeKey];
    for (let i = 0; i < count; i++) {
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
        facing: defaultFacing,
        x: undefined,
        y: undefined,
        activatedThisTurn: false,
        library: [],
        libraryCapacity: base.libraryCapacity,
        attackProfiles: base.attackProfiles.map(a => ({ ...a })),
        abilities: [...base.abilities]
      });
    }
  }
  return pieces;
}

function startMatchFromLobby() {
  appState.screen = 'GAME_BOARD';

  const whitePieces = buildCustomArmyPieces('white', appState.lobby.whiteArmyConfig);
  const blackPieces = buildCustomArmyPieces('black', appState.lobby.blackArmyConfig);

  const piecesMap = {};
  [...whitePieces, ...blackPieces].forEach(p => piecesMap[p.id] = p);

  const boardGrid = Array.from({ length: 12 }, (_, r) =>
    Array.from({ length: 12 }, (_, c) => ({ x: c, y: r, terrain: 'neutral' }))
  );

  const shuffleDeck = () => {
    const d = DEFAULT_CARDS.map((c, i) => ({ ...c, uid: `card_${i}_${Math.random().toString(36).substr(2, 5)}` }));
    for (let i = d.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [d[i], d[j]] = [d[j], d[i]];
    }
    return d;
  };

  const whiteDeck = shuffleDeck();
  const blackDeck = shuffleDeck();

  appState.game = {
    phase: 'DEPLOYMENT',
    roundNumber: 1,
    activePlayer: 'white',
    activationPoints: 4,
    mana: { white: { fire: 0, earth: 0, water: 0, air: 0 }, black: { fire: 0, earth: 0, water: 0, air: 0 } },
    starvation: { white: 0, black: 0 },
    decks: { white: whiteDeck, black: blackDeck },
    hands: { white: whiteDeck.splice(0, 5), black: blackDeck.splice(0, 5) },
    boardGrid,
    piecesMap,
    combatLogs: ['🎮 Match Initialized! Alternating deployment turns: White places 1 piece, then Black places 1 piece. Default facing points toward opponent.']
  };

  broadcastStateUpdate();
  renderGameBoardScreen();
}

function startLightningMatch() {
  appState.screen = 'GAME_BOARD';

  const whitePieces = buildCustomArmyPieces('white', { pawn: 8, bishop: 2, rook: 2, knight: 2, queen: 1, king: 1 });
  const blackPieces = buildCustomArmyPieces('black', { pawn: 8, bishop: 2, rook: 2, knight: 2, queen: 1, king: 1 });

  const wBackRow = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'];
  let wPawnIdx = 0, wBackIdx = 0;

  whitePieces.forEach(p => {
    p.facing = 0; // North (UP)
    if (p.type === 'pawn') {
      p.x = wPawnIdx;
      p.y = 10; // Row 10 (Rank 2)
      wPawnIdx++;
    } else {
      if (wBackIdx < wBackRow.length) {
        p.x = wBackIdx;
        p.y = 11; // Row 11 (Rank 1)
        wBackIdx++;
      } else {
        p.x = wPawnIdx++;
        p.y = 10;
      }
    }
  });

  let bPawnIdx = 0, bBackIdx = 0;
  blackPieces.forEach(p => {
    p.facing = 2; // South (DOWN)
    if (p.type === 'pawn') {
      p.x = bPawnIdx;
      p.y = 1; // Row 1 (Rank 11)
      bPawnIdx++;
    } else {
      if (bBackIdx < wBackRow.length) {
        p.x = bBackIdx;
        p.y = 0; // Row 0 (Rank 12)
        bBackIdx++;
      } else {
        p.x = bPawnIdx++;
        p.y = 1;
      }
    }
  });

  const piecesMap = {};
  [...whitePieces, ...blackPieces].forEach(p => piecesMap[p.id] = p);

  const boardGrid = Array.from({ length: 12 }, (_, r) =>
    Array.from({ length: 12 }, (_, c) => ({ x: c, y: r, terrain: 'neutral' }))
  );

  const createHandWithLandsAndSpells = () => {
    return [
      { id: 'l_f4', uid: `card_f4_${Math.random()}`, name: 'Infernal Spire (Fire 4)', type: 'LAND', element: 'fire', tileCount: 4, apCost: 1, description: 'Converts 4 connected tiles to Fire terrain.' },
      { id: 'l_e4', uid: `card_e4_${Math.random()}`, name: 'Stone Bastion (Earth 4)', type: 'LAND', element: 'earth', tileCount: 4, apCost: 1, description: 'Converts 4 connected tiles to Earth terrain.' },
      { id: 'l_w4', uid: `card_w4_${Math.random()}`, name: 'Tidal Pool (Water 4)', type: 'LAND', element: 'water', tileCount: 4, apCost: 1, description: 'Converts 4 connected tiles to Water terrain.' },
      { id: 'l_a4', uid: `card_a4_${Math.random()}`, name: 'Gale Valley (Air 4)', type: 'LAND', element: 'air', tileCount: 4, apCost: 1, description: 'Converts 4 connected tiles to Air terrain.' },
      { id: 's_f_infusion', uid: `card_sp_${Math.random()}`, name: 'Flame Infusion', type: 'SPELL', timing: 'OWN_TURN', apCost: 1, effect: { type: 'BUFF_ATTACK', amount: 3 }, description: '[Own Turn] Adds +3 Attack to your active unit.' },
      { id: 's_e_aegis', uid: `card_sa_${Math.random()}`, name: 'Earthen Aegis', type: 'SPELL', timing: 'REACTION', apCost: 0, effect: { type: 'BUFF_DEFENSE', amount: 3 }, description: '[Reaction] Adds +3 Defense to defending unit.' }
    ];
  };

  const deck = DEFAULT_CARDS.map((c, i) => ({ ...c, uid: `card_d_${i}` }));

  appState.game = {
    phase: 'PLAYER_TURN',
    roundNumber: 1,
    activePlayer: 'white',
    activationPoints: 4,
    mana: { white: { fire: 0, earth: 0, water: 0, air: 0 }, black: { fire: 0, earth: 0, water: 0, air: 0 } },
    starvation: { white: 0, black: 0 },
    decks: { white: [...deck], black: [...deck] },
    hands: { white: createHandWithLandsAndSpells(), black: createHandWithLandsAndSpells() },
    boardGrid,
    piecesMap,
    combatLogs: [
      '⚡ LIGHTNING MODE ACTIVATED! Armies pre-deployed.',
      '🔥 Pre-loaded hands with Fire 4, Earth 4, Water 4, Air 4 Land cards + Spells.',
      '🏁 Round 1 White turn begins. You have 4 AP!'
    ]
  };

  broadcastStateUpdate();
  renderGameBoardScreen();
}

// ==========================================================================
// 4. GAME BOARD SCREEN, RANK/FILE LABELS & LAND PLACEMENT BANNER
// ==========================================================================

function renderGameBoardScreen() {
  const container = document.getElementById('appContainer');
  container.innerHTML = `
    <!-- Top App Header -->
    <header class="app-header">
      <div class="logo-group">
        <div class="logo-icon">👑</div>
        <div class="logo-text">
          <h1>TILE KINGS</h1>
          <p>Lobby: ${appState.lobby.code}</p>
        </div>
      </div>

      <div class="game-status-bar">
        <div id="roundCounter" style="font-weight: 800; font-size: 0.9rem; color: var(--accent-gold);">ROUND 1</div>
        <div id="turnBadge" class="phase-badge white-turn">WHITE'S TURN</div>
        <div class="ap-container">
          <span class="ap-label">AP:</span>
          <div id="apOrbs" class="ap-orbs"></div>
        </div>
      </div>
    </header>

    <!-- Main Workspace -->
    <main class="main-workspace">
      <!-- Left Panel -->
      <aside class="side-panel">
        <div class="panel-title"><span>⚡ Elemental Mana</span></div>
        <div class="mana-grid">
          <div class="mana-card fire"><span>🔥 Fire</span><span id="valFireMana" class="mana-val">0</span></div>
          <div class="mana-card earth"><span>🌍 Earth</span><span id="valEarthMana" class="mana-val">0</span></div>
          <div class="mana-card water"><span>💧 Water</span><span id="valWaterMana" class="mana-val">0</span></div>
          <div class="mana-card air"><span>💨 Air</span><span id="valAirMana" class="mana-val">0</span></div>
        </div>

        <div style="background: rgba(0,0,0,0.25); padding: 10px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.05); margin-top: 10px;">
          <div style="font-size: 0.8rem; font-weight: 700; color: var(--accent-red); margin-bottom: 4px;">
            💀 Starvation Strikes (2 = Loss)
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 0.8rem;">
            <span>White: <strong id="whiteStarvationVal">0/2</strong></span>
            <span>Black: <strong id="blackStarvationVal">0/2</strong></span>
          </div>
        </div>

        <div class="panel-title" style="margin-top: 12px;"><span>♟️ Selected Unit</span></div>
        <div id="selectedPieceInfo" style="background: rgba(0,0,0,0.25); padding: 12px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.05);"></div>

        <div style="display: flex; flex-direction: column; gap: 8px; margin-top: 8px;">
          <div style="display: flex; gap: 6px;">
            <button id="rotateCcwBtn" class="btn" style="flex: 1;" disabled>↺ Pivot Left</button>
            <button id="rotateCwBtn" class="btn" style="flex: 1;" disabled>↻ Pivot Right</button>
          </div>
          <button id="inspectPieceBtn" class="btn btn-warning" style="width: 100%;" disabled>📜 Inspect Rules Card</button>
          <button id="libraryBtn" class="btn" style="width: 100%; color: #c084fc;" disabled>📚 Open Library Vault</button>
        </div>

        <hr style="border-color: rgba(255,255,255,0.08); margin: 8px 0;">
        <button id="balanceEditorBtn" class="btn" style="background: rgba(245, 158, 11, 0.15); border-color: #f59e0b; color: #fbbf24;">
          ⚖️ Live Data Balance Editor
        </button>
      </aside>

      <!-- Center Board Container -->
      <section class="board-container">
        <!-- Off-Board Deployment Reserve Tray -->
        <div id="reserveTrayContainer"></div>

        <!-- Land Placement Progress Control Banner -->
        <div id="landPlacementBannerContainer"></div>

        <!-- Rank & File Outer Border Wrapper -->
        <div class="board-outer-wrapper">
          <div class="file-labels-row" style="grid-row: 1;">
            ${FILES.map(f => `<div>${f}</div>`).join('')}
          </div>

          <div class="rank-labels-col" style="grid-column: 1; grid-row: 2;">
            ${RANKS.map(r => `<div>${r}</div>`).join('')}
          </div>

          <div id="boardContainer" style="grid-column: 2; grid-row: 2;"></div>

          <div class="rank-labels-col" style="grid-column: 3; grid-row: 2;">
            ${RANKS.map(r => `<div>${r}</div>`).join('')}
          </div>

          <div class="file-labels-row" style="grid-row: 3;">
            ${FILES.map(f => `<div>${f}</div>`).join('')}
          </div>
        </div>

        <div class="action-controls">
          <button id="endTurnBtn" class="btn btn-primary">➡️ End Turn / Pass</button>
          <button id="kingDrawBtn" class="btn btn-warning">👑 King Draw (1 AP)</button>
          <button id="exitLobbyBtn" class="btn">🚪 Exit to Lobby</button>
        </div>
      </section>

      <!-- Right Panel -->
      <aside class="side-panel">
        <div class="panel-title"><span>📜 Battle Audit Log</span></div>
        <div id="combatLogContainer"></div>

        <div class="panel-title" style="margin-top: 12px;"><span>🎴 Player Hand & Cards</span></div>
        <div id="cardHandContainer"></div>
      </aside>
    </main>

    <div id="modalContainer"></div>
  `;

  bindGameBoardEvents();
  updateBoardUI();
}

function renderLandPlacementBanner(containerEl) {
  const mode = appState.pendingLandPlacement;
  if (!mode) {
    containerEl.innerHTML = '';
    return;
  }

  const placedCount = mode.placedTiles.length;
  const targetCount = mode.targetCount;
  const isBaseStep = placedCount === 0;

  const bannerHtml = `
    <div class="land-placement-banner">
      <div>
        <div style="font-weight: 800; font-size: 0.9rem; color: #fbbf24; display: flex; align-items: center; gap: 8px;">
          <span>🌍 LAND PLACING MODE:</span> ${mode.card.name}
        </div>
        <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 2px;">
          ${isBaseStep ? 'Step 1: Click any valid base tile in your half to anchor land.' : `Step 2: Click a highlighted adjacent square to place Tile ${placedCount + 1}/${targetCount}.`}
        </div>
      </div>

      <div style="display: flex; align-items: center; gap: 10px;">
        <span style="font-family: 'JetBrains Mono', monospace; font-size: 1.1rem; font-weight: 800; color: #34d399;">
          ${placedCount} / ${targetCount} TILES
        </span>
        <button id="undoTileBtn" class="btn" style="padding: 4px 10px; font-size: 0.75rem;" ${placedCount === 0 ? 'disabled' : ''}>
          ↩️ Undo Tile
        </button>
        <button id="cancelPlacementBtn" class="btn btn-danger" style="padding: 4px 10px; font-size: 0.75rem;">
          ❌ Cancel
        </button>
      </div>
    </div>
  `;

  containerEl.innerHTML = bannerHtml;

  const undoBtn = containerEl.querySelector('#undoTileBtn');
  if (undoBtn) {
    undoBtn.addEventListener('click', () => {
      if (mode.placedTiles.length > 0) {
        const lastTile = mode.placedTiles.pop();
        const cell = appState.game.boardGrid[lastTile.y][lastTile.x];
        cell.terrain = lastTile.oldTerrain;
        updateBoardUI();
      }
    });
  }

  const cancelBtn = containerEl.querySelector('#cancelPlacementBtn');
  if (cancelBtn) {
    cancelBtn.addEventListener('click', () => {
      // Revert all placed tiles
      mode.placedTiles.forEach(t => {
        appState.game.boardGrid[t.y][t.x].terrain = t.oldTerrain;
      });
      appState.pendingLandPlacement = null;
      logAction(`❌ Cancelled land card placement.`);
      updateBoardUI();
    });
  }
}

function renderReserveTray(containerEl) {
  const game = appState.game;
  if (!game || game.phase !== 'DEPLOYMENT') {
    containerEl.innerHTML = '';
    return;
  }

  const activeP = game.activePlayer;
  const unplacedUnits = Object.values(game.piecesMap).filter(p => p.owner === activeP && p.x === undefined);

  const countsByType = {};
  unplacedUnits.forEach(p => {
    countsByType[p.type] = (countsByType[p.type] || 0) + 1;
  });

  const isWhite = activeP === 'white';
  const defaultFacingText = isWhite ? 'North (UP)' : 'South (DOWN)';

  const trayHtml = `
    <div class="reserve-tray" style="border-color: ${isWhite ? '#38bdf8' : '#c084fc'};">
      <div class="reserve-tray-header">
        <span style="color: ${isWhite ? '#38bdf8' : '#c084fc'};">📦 ${activeP.toUpperCase()}'S RESERVE TRAY (${unplacedUnits.length} UNITS REMAINING)</span>
        <span style="font-size: 0.75rem; color: var(--text-muted);">Default Facing: ${defaultFacingText}</span>
      </div>

      <div style="font-size: 0.75rem; color: var(--text-muted); margin-bottom: 8px;">
        Alternating Deployment: Click unit from tray -> place in highlighted zone (${isWhite ? 'Rows 8-11 / Ranks 1-4' : 'Rows 0-3 / Ranks 9-12'}). Turn then swaps to opponent! Click placed unit to recall.
      </div>

      <div class="reserve-tray-grid">
        ${Object.keys(DEFAULT_PIECES).map(typeKey => {
          const pData = DEFAULT_PIECES[typeKey];
          const cnt = countsByType[typeKey] || 0;
          const isSelected = appState.selectedReserveType === typeKey;

          return `
            <div class="reserve-item ${isSelected ? 'selected' : ''}" data-type="${typeKey}" style="${cnt === 0 ? 'opacity: 0.3;' : ''}">
              ${cnt > 0 ? `<span class="reserve-badge">${cnt}</span>` : ''}
              <span style="font-size: 1.4rem;">${pData.symbol}</span>
              <span style="font-size: 0.7rem; font-weight: 700;">${pData.name}</span>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;

  containerEl.innerHTML = trayHtml;

  containerEl.querySelectorAll('.reserve-item').forEach(el => {
    el.addEventListener('click', () => {
      const typeKey = el.dataset.type;
      if (countsByType[typeKey] > 0) {
        appState.selectedReserveType = typeKey;
        appState.selectedPieceId = null;
        updateBoardUI();
      }
    });
  });
}

function bindGameBoardEvents() {
  document.getElementById('endTurnBtn').addEventListener('click', handleEndTurn);
  document.getElementById('kingDrawBtn').addEventListener('click', handleKingDraw);
  document.getElementById('rotateCwBtn').addEventListener('click', () => handleRotatePiece('CW'));
  document.getElementById('rotateCcwBtn').addEventListener('click', () => handleRotatePiece('CCW'));
  document.getElementById('inspectPieceBtn').addEventListener('click', handleInspectPiece);
  document.getElementById('libraryBtn').addEventListener('click', handleOpenLibrary);
  document.getElementById('balanceEditorBtn').addEventListener('click', handleOpenBalanceEditor);
  document.getElementById('exitLobbyBtn').addEventListener('click', () => {
    if (confirm('Exit match to Lobby?')) {
      appState.screen = 'LOBBY_ROOM';
      broadcastStateUpdate();
      renderLobbyScreen();
    }
  });
}

function updateBoardUI() {
  const game = appState.game;
  if (!game) return;

  document.getElementById('roundCounter').innerText = `ROUND ${game.roundNumber}`;
  const turnBadge = document.getElementById('turnBadge');

  if (game.phase === 'DEPLOYMENT') {
    turnBadge.innerText = `DEPLOYMENT: ${game.activePlayer.toUpperCase()} PLACING 1 UNIT`;
    turnBadge.className = `phase-badge ${game.activePlayer}-turn`;
  } else if (game.phase === 'GAME_OVER') {
    turnBadge.innerText = `VICTORY: ${game.winner.toUpperCase()} WINS!`;
    turnBadge.className = 'phase-badge';
  } else {
    turnBadge.innerText = `${game.activePlayer.toUpperCase()}'S TURN`;
    turnBadge.className = `phase-badge ${game.activePlayer}-turn`;
  }

  // AP Orbs
  const apContainer = document.getElementById('apOrbs');
  apContainer.innerHTML = '';
  for (let i = 0; i < 4; i++) {
    const orb = document.createElement('div');
    orb.className = `ap-orb ${i < game.activationPoints ? 'active' : ''}`;
    apContainer.appendChild(orb);
  }

  // Mana & Starvation
  const activeMana = game.mana[game.activePlayer] || { fire: 0, earth: 0, water: 0, air: 0 };
  document.getElementById('valFireMana').innerText = activeMana.fire;
  document.getElementById('valEarthMana').innerText = activeMana.earth;
  document.getElementById('valWaterMana').innerText = activeMana.water;
  document.getElementById('valAirMana').innerText = activeMana.air;

  document.getElementById('whiteStarvationVal').innerText = `${game.starvation.white}/2`;
  document.getElementById('blackStarvationVal').innerText = `${game.starvation.black}/2`;

  // Render Reserve Tray & Land Placement Banner
  renderReserveTray(document.getElementById('reserveTrayContainer'));
  renderLandPlacementBanner(document.getElementById('landPlacementBannerContainer'));

  // Selected piece info
  const selPiece = appState.selectedPieceId ? game.piecesMap[appState.selectedPieceId] : null;
  const selInfoEl = document.getElementById('selectedPieceInfo');

  if (selPiece) {
    selInfoEl.innerHTML = `
      <div style="font-weight: 700; font-size: 1rem; display: flex; justify-content: space-between;">
        <span>${selPiece.symbol} ${selPiece.name} (${selPiece.owner.toUpperCase()})</span>
        <span style="color: #f87171;">${selPiece.hp}/${selPiece.maxHP} HP</span>
      </div>
      <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 4px;">
        Facing: ${FACING_NAMES[selPiece.facing]} • DEF: ${selPiece.defense} • Move: ${selPiece.movement.maxDistance}
      </div>
    `;
    document.getElementById('rotateCwBtn').disabled = game.activationPoints <= 0 || selPiece.owner !== game.activePlayer;
    document.getElementById('rotateCcwBtn').disabled = game.activationPoints <= 0 || selPiece.owner !== game.activePlayer;
    document.getElementById('inspectPieceBtn').disabled = false;
    document.getElementById('libraryBtn').disabled = !(selPiece.libraryCapacity > 0);
  } else if (appState.selectedReserveType) {
    const pData = DEFAULT_PIECES[appState.selectedReserveType];
    selInfoEl.innerHTML = `
      <div style="font-size: 0.85rem; color: #fbbf24; font-weight: 700;">
        Selected from Tray: ${pData.symbol} ${pData.name}
      </div>
      <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 2px;">
        Click an empty highlighted tile in your deployment zone to place.
      </div>
    `;
    document.getElementById('rotateCwBtn').disabled = true;
    document.getElementById('rotateCcwBtn').disabled = true;
    document.getElementById('inspectPieceBtn').disabled = true;
    document.getElementById('libraryBtn').disabled = true;
  } else {
    selInfoEl.innerHTML = `<div style="font-size: 0.8rem; color: var(--text-muted);">Select a unit from reserve tray or board.</div>`;
    document.getElementById('rotateCwBtn').disabled = true;
    document.getElementById('rotateCcwBtn').disabled = true;
    document.getElementById('inspectPieceBtn').disabled = true;
    document.getElementById('libraryBtn').disabled = true;
  }

  // Legal moves, legal attacks, and Land placement highlights
  let legalMoves = [];
  let legalAttacks = [];
  let validLandBaseTiles = [];
  let validLandAdjacentTiles = [];

  if (appState.pendingLandPlacement) {
    const mode = appState.pendingLandPlacement;
    const activeP = game.activePlayer;
    const isWhite = activeP === 'white';

    if (mode.placedTiles.length === 0) {
      // Step 1: Base Tile selection in player half (Rows 6-11 for White, Rows 0-5 for Black)
      for (let r = 0; r < 12; r++) {
        for (let c = 0; c < 12; c++) {
          const isValidZone = isWhite ? r >= 6 : r <= 5;
          if (isValidZone && game.boardGrid[r][c].terrain === 'neutral') {
            validLandBaseTiles.push({ x: c, y: r });
          }
        }
      }
    } else {
      // Step 2: Connected Orthogonal Adjacent tile expansion
      const neighbors = [{ dx: 1, dy: 0 }, { dx: -1, dy: 0 }, { dx: 0, dy: 1 }, { dx: 0, dy: -1 }];
      const adjacentMap = new Set();

      mode.placedTiles.forEach(pt => {
        neighbors.forEach(n => {
          const nx = pt.x + n.dx;
          const ny = pt.y + n.dy;
          if (isInBounds(nx, ny) && game.boardGrid[ny][nx].terrain === 'neutral') {
            const isAlreadyPlaced = mode.placedTiles.some(t => t.x === nx && t.y === ny);
            if (!isAlreadyPlaced) {
              adjacentMap.add(`${nx},${ny}`);
            }
          }
        });
      });

      adjacentMap.forEach(key => {
        const [x, y] = key.split(',').map(Number);
        validLandAdjacentTiles.push({ x, y });
      });
    }
  } else if (selPiece && selPiece.owner === game.activePlayer && !selPiece.activatedThisTurn && game.phase === 'PLAYER_TURN') {
    legalMoves = getLegalMoves(selPiece, game.boardGrid, game.piecesMap);
    if (selPiece.attackProfiles && selPiece.attackProfiles.length > 0) {
      legalAttacks = getLegalAttackTargets(selPiece, selPiece.attackProfiles[0], game.piecesMap);
    }
  }

  // Render Board
  renderBoard(document.getElementById('boardContainer'), game, {
    selectedPieceId: appState.selectedPieceId,
    legalMoves,
    legalAttacks,
    validLandBaseTiles,
    validLandAdjacentTiles,
    onTileClick: handleTileClick,
    onPieceClick: (p) => {
      if (game.phase === 'DEPLOYMENT') {
        if (p.owner === game.activePlayer) {
          p.x = undefined;
          p.y = undefined;
          appState.selectedPieceId = null;
          logAction(`↩️ Recalled ${p.name} back to Off-Board Reserve Tray.`);
          broadcastStateUpdate();
          updateBoardUI();
          return;
        }
      }
      appState.selectedPieceId = p.id;
      appState.selectedReserveType = null;
      updateBoardUI();
    }
  });

  // Render Hand & Log
  renderCardHand(document.getElementById('cardHandContainer'), game, {
    onPlayLandCard: (card) => {
      if (game.activationPoints < card.apCost) {
        logAction(`❌ Not enough AP to play ${card.name}.`);
        return;
      }

      appState.pendingLandPlacement = {
        card: card,
        targetCount: card.tileCount || 4,
        element: card.element,
        placedTiles: []
      };

      logAction(`🌍 Selected ${card.name}. Click a base tile in your half to start placing.`);
      updateBoardUI();
    },
    onCastSpellCard: (card) => {
      if (game.activationPoints < card.apCost) {
        logAction(`❌ Not enough AP to cast ${card.name}.`);
        return;
      }
      game.activationPoints -= card.apCost;
      const hand = game.hands[game.activePlayer];
      const idx = hand.findIndex(c => c.uid === card.uid);
      if (idx >= 0) hand.splice(idx, 1);
      logAction(`✨ ${game.activePlayer.toUpperCase()} cast ${card.name}! (${card.description})`);
      broadcastStateUpdate();
      updateBoardUI();
    }
  });

  renderCombatLog(document.getElementById('combatLogContainer'), game.combatLogs);
}

// ==========================================================================
// 5. GRID MATH & PATHFINDING
// ==========================================================================

function isInBounds(x, y) { return x >= 0 && x < 12 && y >= 0 && y < 12; }

function getRelativeVectors(facing) {
  const dirs = [{ x: 0, y: -1 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: -1, y: 0 }];
  const front = dirs[facing];
  const right = dirs[(facing + 1) % 4];
  const back = dirs[(facing + 2) % 4];
  const left = dirs[(facing + 3) % 4];
  return {
    front, right, back, left,
    frontLeft: { x: front.x + left.x, y: front.y + left.y },
    frontRight: { x: front.x + right.x, y: front.y + right.y },
    backLeft: { x: back.x + left.x, y: back.y + left.y },
    backRight: { x: back.x + right.x, y: back.y + right.y }
  };
}

function getLegalMoves(piece, boardGrid, piecesMap) {
  if (!piece || piece.x === undefined) return [];
  const moves = [];
  const rel = getRelativeVectors(piece.facing);
  const pattern = piece.movement.type;
  const maxDist = piece.movement.maxDistance;

  const isBlocked = (x, y) => {
    const occ = Object.values(piecesMap).find(p => p.x === x && p.y === y && p.hp > 0);
    return occ ? { blocked: true, friendly: occ.owner === piece.owner, enemy: occ.owner !== piece.owner } : { blocked: false };
  };

  if (pattern === 'straight_front') {
    const nx = piece.x + rel.front.x;
    const ny = piece.y + rel.front.y;
    if (isInBounds(nx, ny) && !isBlocked(nx, ny).blocked) moves.push({ x: nx, y: ny });
  } else if (pattern === 'orthogonal' || pattern === 'omni' || pattern === 'diagonal') {
    let dirs = [];
    if (pattern === 'orthogonal') dirs = [rel.front, rel.right, rel.back, rel.left];
    if (pattern === 'diagonal') dirs = [rel.frontLeft, rel.frontRight, rel.backLeft, rel.backRight];
    if (pattern === 'omni') dirs = [rel.front, rel.right, rel.back, rel.left, rel.frontLeft, rel.frontRight, rel.backLeft, rel.backRight];

    for (const d of dirs) {
      for (let dist = 1; dist <= maxDist; dist++) {
        const nx = piece.x + d.x * dist;
        const ny = piece.y + d.y * dist;
        if (!isInBounds(nx, ny)) break;
        const occ = isBlocked(nx, ny);
        if (!occ.blocked) moves.push({ x: nx, y: ny });
        else break;
      }
    }
  } else if (pattern === 'l_shape') {
    const offsets = [
      { x: rel.front.x * 2 + rel.left.x, y: rel.front.y * 2 + rel.left.y },
      { x: rel.front.x * 2 + rel.right.x, y: rel.front.y * 2 + rel.right.y },
      { x: rel.back.x * 2 + rel.left.x, y: rel.back.y * 2 + rel.left.y },
      { x: rel.back.x * 2 + rel.right.x, y: rel.back.y * 2 + rel.right.y }
    ];
    for (const off of offsets) {
      const nx = piece.x + off.x;
      const ny = piece.y + off.y;
      if (isInBounds(nx, ny) && !isBlocked(nx, ny).blocked) moves.push({ x: nx, y: ny });
    }
  }
  return moves;
}

function getLegalAttackTargets(piece, profile, piecesMap) {
  if (!piece || !profile) return [];
  const targets = [];
  const rel = getRelativeVectors(piece.facing);

  const check = (x, y) => {
    if (!isInBounds(x, y)) return;
    const occ = Object.values(piecesMap).find(p => p.x === x && p.y === y && p.hp > 0);
    if (occ && occ.owner !== piece.owner) targets.push({ x, y, targetUnit: occ });
  };

  if (profile.pattern === 'front_line') {
    for (let r = 1; r <= profile.range; r++) check(piece.x + rel.front.x * r, piece.y + rel.front.y * r);
  } else if (profile.pattern === 'front_arc') {
    check(piece.x + rel.front.x, piece.y + rel.front.y);
    check(piece.x + rel.frontLeft.x, piece.y + rel.frontLeft.y);
    check(piece.x + rel.frontRight.x, piece.y + rel.frontRight.y);
  } else if (profile.pattern === 'all_surrounding') {
    for (let dx = -profile.range; dx <= profile.range; dx++) {
      for (let dy = -profile.range; dy <= profile.range; dy++) {
        if (dx !== 0 || dy !== 0) check(piece.x + dx, piece.y + dy);
      }
    }
  }
  return targets;
}

function calculateGenerationPhaseMana(boardGrid, piecesMap) {
  const visited = Array.from({ length: 12 }, () => Array(12).fill(false));
  const regions = [];

  for (let r = 0; r < 12; r++) {
    for (let c = 0; c < 12; c++) {
      const terrain = boardGrid[r][c].terrain;
      if (terrain !== 'neutral' && !visited[r][c]) {
        const tiles = [];
        const queue = [{ x: c, y: r }];
        visited[r][c] = true;

        while (queue.length > 0) {
          const curr = queue.shift();
          tiles.push(curr);
          for (const n of [{ x: 1, y: 0 }, { x: -1, y: 0 }, { x: 0, y: 1 }, { x: 0, y: -1 }]) {
            const nx = curr.x + n.x;
            const ny = curr.y + n.y;
            if (isInBounds(nx, ny) && !visited[ny][nx] && boardGrid[ny][nx].terrain === terrain) {
              visited[ny][nx] = true;
              queue.push({ x: nx, y: ny });
            }
          }
        }
        regions.push({ element: terrain, tiles, tileCount: tiles.length });
      }
    }
  }

  const whiteMana = { fire: 0, earth: 0, water: 0, air: 0 };
  const blackMana = { fire: 0, earth: 0, water: 0, air: 0 };
  const logs = [];

  for (const reg of regions) {
    let wHP = 0, bHP = 0;
    for (const t of reg.tiles) {
      const p = Object.values(piecesMap).find(unit => unit.x === t.x && unit.y === t.y && unit.hp > 0);
      if (p) {
        if (p.owner === 'white') wHP += p.hp;
        else if (p.owner === 'black') bHP += p.hp;
      }
    }

    let winner = null, effHP = 0;
    if (wHP > bHP) { winner = 'white'; effHP = wHP - bHP; }
    else if (bHP > wHP) { winner = 'black'; effHP = bHP - wHP; }

    const manaVal = Math.floor(Math.min(reg.tileCount, effHP) / 2);
    if (winner && manaVal > 0) {
      if (winner === 'white') whiteMana[reg.element] += manaVal;
      else blackMana[reg.element] += manaVal;
      logs.push(`Region [${reg.element.toUpperCase()}] (${reg.tileCount} tiles): White HP=${wHP}, Black HP=${bHP} => ${winner.toUpperCase()} generates ${manaVal} ${reg.element.toUpperCase()} Mana.`);
    } else {
      logs.push(`Region [${reg.element.toUpperCase()}] (${reg.tileCount} tiles): White HP=${wHP}, Black HP=${bHP} => 0 Mana generated.`);
    }
  }
  return { whiteMana, blackMana, logs };
}

// ==========================================================================
// 6. BOARD COMPONENT RENDERERS WITH SEPARATED NON-OVERLAPPING BADGES
// ==========================================================================

function renderBoard(containerEl, gameState, options = {}) {
  const {
    selectedPieceId,
    legalMoves = [],
    legalAttacks = [],
    validLandBaseTiles = [],
    validLandAdjacentTiles = [],
    onTileClick = () => {},
    onPieceClick = () => {}
  } = options;

  const { boardGrid, piecesMap, phase, activePlayer } = gameState;

  containerEl.innerHTML = '';
  const gridEl = document.createElement('div');
  gridEl.className = 'board-grid-12x12';

  for (let r = 0; r < 12; r++) {
    for (let c = 0; c < 12; c++) {
      const cell = boardGrid[r][c];
      const cellEl = document.createElement('div');

      const isLight = (r + c) % 2 === 0;
      const baseClass = isLight ? 'neutral-light' : 'neutral-dark';
      const terrainClass = cell.terrain !== 'neutral' ? `${cell.terrain}-${isLight ? 'light' : 'dark'}` : baseClass;

      cellEl.className = `board-cell ${baseClass} ${terrainClass}`;

      // Deployment Zone Overlay
      if (phase === 'DEPLOYMENT') {
        if (activePlayer === 'white' && r >= 8) cellEl.classList.add('white-deploy-zone');
        if (activePlayer === 'black' && r <= 3) cellEl.classList.add('black-deploy-zone');
      }

      // Land placement highlights
      if (validLandBaseTiles.some(t => t.x === c && t.y === r)) cellEl.classList.add('valid-land-base');
      if (validLandAdjacentTiles.some(t => t.x === c && t.y === r)) cellEl.classList.add('valid-land-adjacent');

      // Move & Attack highlights
      if (legalMoves.some(m => m.x === c && m.y === r)) cellEl.classList.add('legal-move');
      if (legalAttacks.some(a => a.x === c && a.y === r)) cellEl.classList.add('legal-attack');

      const piece = Object.values(piecesMap).find(p => p.x === c && p.y === r && p.hp > 0);
      if (piece) {
        if (selectedPieceId === piece.id) cellEl.classList.add('selected-tile');

        const token = document.createElement('div');
        token.className = `piece-token ${piece.owner} ${selectedPieceId === piece.id ? 'selected' : ''} ${piece.activatedThisTurn ? 'activated' : ''}`;
        token.innerText = piece.symbol;

        // Facing Arrow Badge at Top-Center
        const arrow = document.createElement('span');
        arrow.className = 'facing-arrow';
        arrow.innerText = FACING_ARROWS[piece.facing];
        token.appendChild(arrow);

        // HP Badge at Bottom-Center
        const hpBadge = document.createElement('span');
        hpBadge.className = 'hp-badge';
        hpBadge.innerText = `${piece.hp}/${piece.maxHP}`;
        token.appendChild(hpBadge);

        token.addEventListener('click', (e) => {
          e.stopPropagation();
          onPieceClick(piece);
        });
        cellEl.appendChild(token);
      }

      cellEl.addEventListener('click', () => onTileClick(c, r, cell, piece));
      gridEl.appendChild(cellEl);
    }
  }
  containerEl.appendChild(gridEl);
}

function renderCardHand(containerEl, gameState, options = {}) {
  const { onPlayLandCard = () => {}, onCastSpellCard = () => {} } = options;
  const activeP = gameState.activePlayer;
  const hand = gameState.hands[activeP] || [];

  containerEl.innerHTML = `
    <div style="font-weight: 700; font-size: 0.85rem; text-transform: uppercase; color: var(--text-muted); margin-bottom: 8px;">
      🎴 ${activeP.toUpperCase()}'S HAND (${hand.length}/7)
    </div>
  `;

  const bar = document.createElement('div');
  bar.className = 'card-hand-bar';

  if (hand.length === 0) {
    bar.innerHTML = `<div style="font-size: 0.8rem; color: var(--text-muted); padding: 12px;">Hand empty. Use King Draw (1 AP) to draw.</div>`;
  } else {
    hand.forEach(card => {
      const cardEl = document.createElement('div');
      cardEl.className = `mini-card ${card.type.toLowerCase()}`;
      cardEl.innerHTML = `
        <div>
          <div class="mini-card-title">${card.name}</div>
          <div style="font-size: 0.65rem; color: var(--text-muted);">${card.type}</div>
        </div>
        <div style="font-size: 0.65rem; color: var(--text-muted); margin-top: 4px; line-height: 1.2;">${card.description}</div>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 6px;">
          <span class="mini-card-cost">${card.apCost} AP</span>
          <button class="btn btn-primary play-btn" style="padding: 2px 8px; font-size: 0.7rem;">Play</button>
        </div>
      `;
      cardEl.querySelector('.play-btn').addEventListener('click', () => {
        if (card.type === 'LAND') onPlayLandCard(card);
        else onCastSpellCard(card);
      });
      bar.appendChild(cardEl);
    });
  }
  containerEl.appendChild(bar);
}

function renderCombatLog(containerEl, logs = []) {
  containerEl.innerHTML = '';
  const box = document.createElement('div');
  box.className = 'combat-log-box';
  logs.forEach(l => {
    const d = document.createElement('div');
    d.className = 'log-entry';
    d.innerText = l;
    box.appendChild(d);
  });
  box.scrollTop = box.scrollHeight;
  containerEl.appendChild(box);
}

// ==========================================================================
// 7. BOARD TILE CLICK & MULTI-TILE LAND PLACEMENT HANDLERS
// ==========================================================================

function handleTileClick(x, y, cellData, pieceOnTile) {
  const game = appState.game;
  if (!game || game.phase === 'GAME_OVER') return;

  // Interactive Multi-Tile Land Placement Engine
  if (appState.pendingLandPlacement) {
    const mode = appState.pendingLandPlacement;
    const card = mode.card;
    const activeP = game.activePlayer;
    const isWhite = activeP === 'white';

    // Step 1: Base Tile Selection
    if (mode.placedTiles.length === 0) {
      const isValidZone = isWhite ? y >= 6 : y <= 5;
      if (!isValidZone) {
        logAction(`❌ Base tile must be within your half of the board (${isWhite ? 'Rows 6-11 / Ranks 1-6' : 'Rows 0-5 / Ranks 7-12'}).`);
        return;
      }
      if (cellData.terrain !== 'neutral') {
        logAction(`❌ Base tile must be neutral terrain.`);
        return;
      }

      // Record old terrain and convert tile to Land element
      const oldTerrain = cellData.terrain;
      cellData.terrain = mode.element;
      mode.placedTiles.push({ x, y, oldTerrain });
      logAction(`📍 Placed Base Tile ${1}/${mode.targetCount} at (${FILES[x]}${RANKS[y]}). Click an adjacent highlighted square to expand.`);

    } else {
      // Step 2: Connected Adjacent Tile Expansion
      const isAlreadyPlaced = mode.placedTiles.some(t => t.x === x && t.y === y);
      if (isAlreadyPlaced) return;

      const isAdjacent = mode.placedTiles.some(pt => {
        const dx = Math.abs(pt.x - x);
        const dy = Math.abs(pt.y - y);
        return (dx === 1 && dy === 0) || (dx === 0 && dy === 1);
      });

      if (!isAdjacent) {
        logAction(`❌ Must select an orthogonally adjacent tile touching your placed land region.`);
        return;
      }
      if (cellData.terrain !== 'neutral') {
        logAction(`❌ Tile must be neutral terrain.`);
        return;
      }

      const oldTerrain = cellData.terrain;
      cellData.terrain = mode.element;
      mode.placedTiles.push({ x, y, oldTerrain });
      logAction(`📍 Placed Connected Tile ${mode.placedTiles.length}/${mode.targetCount} at (${FILES[x]}${RANKS[y]}).`);
    }

    // Auto-complete check when target count is reached
    if (mode.placedTiles.length === mode.targetCount) {
      game.activationPoints -= card.apCost;

      const hand = game.hands[activeP];
      const idx = hand.findIndex(c => c.uid === card.uid);
      if (idx >= 0) hand.splice(idx, 1);

      logAction(`🌍 Completed placing ${card.name} (${mode.targetCount} tiles total)!`);
      appState.pendingLandPlacement = null;
      broadcastStateUpdate();
      updateBoardUI();
      return;
    }

    broadcastStateUpdate();
    updateBoardUI();
    return;
  }

  // Alternating Deployment Phase
  if (game.phase === 'DEPLOYMENT') {
    const activeP = game.activePlayer;
    const isWhite = activeP === 'white';
    const isValidZone = isWhite ? y >= 8 : y <= 3;

    if (!isValidZone) {
      logAction(`❌ Must deploy within your highlighted deployment zone (${isWhite ? 'Rows 8-11 / Ranks 1-4' : 'Rows 0-3 / Ranks 9-12'}).`);
      return;
    }
    if (pieceOnTile) {
      logAction(`❌ Tile ${FILES[x]}${RANKS[y]} is already occupied! Click a placed piece to recall it to your tray.`);
      return;
    }

    if (appState.selectedReserveType) {
      const typeKey = appState.selectedReserveType;
      const unplacedPiece = Object.values(game.piecesMap).find(p => p.owner === activeP && p.type === typeKey && p.x === undefined);

      if (unplacedPiece) {
        unplacedPiece.x = x;
        unplacedPiece.y = y;
        unplacedPiece.facing = isWhite ? 0 : 2;

        logAction(`📍 ${activeP.toUpperCase()} deployed ${unplacedPiece.name} at (${FILES[x]}${RANKS[y]}) facing ${FACING_NAMES[unplacedPiece.facing]}.`);
        appState.selectedPieceId = unplacedPiece.id;

        const remainingOfType = Object.values(game.piecesMap).filter(p => p.owner === activeP && p.type === typeKey && p.x === undefined).length;
        if (remainingOfType === 0) appState.selectedReserveType = null;

        const opponentP = activeP === 'white' ? 'black' : 'white';
        const opponentUnplaced = Object.values(game.piecesMap).filter(p => p.owner === opponentP && p.x === undefined).length;

        if (opponentUnplaced > 0) {
          game.activePlayer = opponentP;
          logAction(`➡️ Placement turn swaps to ${opponentP.toUpperCase()}.`);
        }

        const totalUnplaced = Object.values(game.piecesMap).filter(p => p.x === undefined).length;
        if (totalUnplaced === 0) {
          game.phase = 'PLAYER_TURN';
          game.activePlayer = 'white';
          game.activationPoints = 4;
          logAction(`🏁 Deployment Complete! Both armies deployed. ROUND 1 Main Turn Loop begins. White turn.`);
        }

        broadcastStateUpdate();
        updateBoardUI();
      }
    }
    return;
  }

  // Main Turn Movement & Attack
  const selPiece = appState.selectedPieceId ? game.piecesMap[appState.selectedPieceId] : null;

  if (!selPiece || selPiece.owner !== game.activePlayer) {
    if (pieceOnTile) {
      appState.selectedPieceId = pieceOnTile.id;
      appState.selectedReserveType = null;
      updateBoardUI();
    }
    return;
  }

  if (selPiece.activatedThisTurn) {
    logAction(`❌ ${selPiece.name} has already activated this turn!`);
    return;
  }

  const legalMoves = getLegalMoves(selPiece, game.boardGrid, game.piecesMap);
  const isMove = legalMoves.some(m => m.x === x && m.y === y);

  if (isMove && game.activationPoints > 0) {
    selPiece.x = x;
    selPiece.y = y;
    selPiece.activatedThisTurn = true;
    game.activationPoints--;
    logAction(`🏃 Moved ${selPiece.name} to (${FILES[x]}${RANKS[y]}).`);
    broadcastStateUpdate();
    updateBoardUI();
    return;
  }

  // Attack Execution
  if (pieceOnTile && pieceOnTile.owner !== game.activePlayer && game.activationPoints > 0) {
    const legalTargets = getLegalAttackTargets(selPiece, selPiece.attackProfiles[0], game.piecesMap);
    if (legalTargets.some(t => t.x === x && t.y === y)) {
      executeAttackSequence(selPiece, pieceOnTile);
    }
  }
}

function executeAttackSequence(attacker, defender) {
  const game = appState.game;
  const profile = attacker.attackProfiles[0];

  attacker.activatedThisTurn = true;
  game.activationPoints--;

  const defenderOwner = defender.owner;
  const defenderEarthMana = game.mana[defenderOwner].earth;

  const modalContainer = document.getElementById('modalContainer');
  modalContainer.innerHTML = `
    <div class="modal-overlay">
      <div class="modal-content" style="border-top: 6px solid #ef4444;">
        <h2 style="color: #ef4444;">🛡️ DEFENSIVE RESPONSE OPPORTUNITY</h2>
        <p style="color: var(--text-muted); margin-top: 4px;">${defenderOwner.toUpperCase()}'s ${defender.name} is under attack!</p>
        
        <div style="background: rgba(0,0,0,0.3); padding: 12px; border-radius: 10px; margin: 16px 0;">
          <strong>${attacker.name}</strong> attacks with <strong>${profile.name}</strong> (Base ATK: ${profile.attackValue})
        </div>

        <div style="margin-bottom: 16px;">
          <label style="font-weight: 700; display: block; margin-bottom: 6px;">Spend Earth Mana (+1 Defense per Earth Mana):</label>
          <input type="number" id="reactionEarthInput" min="0" max="${defenderEarthMana}" value="0" style="background: #0f172a; border: 1px solid #334155; color: #fff; padding: 6px; border-radius: 6px; width: 100px;">
          <span style="font-size: 0.8rem; color: var(--text-muted); margin-left: 8px;">Available: ${defenderEarthMana} Earth Mana</span>
        </div>

        <div style="display: flex; justify-content: flex-end; gap: 10px;">
          <button class="btn btn-primary" id="confirmReactionBtn">Resolve Combat</button>
        </div>
      </div>
    </div>
  `;

  document.getElementById('confirmReactionBtn').addEventListener('click', () => {
    const spentEarth = parseInt(document.getElementById('reactionEarthInput').value, 10) || 0;
    game.mana[defenderOwner].earth = Math.max(0, defenderEarthMana - spentEarth);

    modalContainer.innerHTML = '';

    // Calculate Anti-X Keyword Bonus
    let antiBonus = 0;
    if (profile.antiKeywords && defender.unitKeywords) {
      profile.antiKeywords.forEach(anti => {
        if (defender.unitKeywords.includes(anti.keyword)) {
          antiBonus += (parseInt(anti.bonus) || 0);
        }
      });
    }

    const baseAtk = parseInt(profile.attackValue) || 3;
    const totalAttack = baseAtk + antiBonus;
    const totalDefense = (defender.defense || 0) + spentEarth;
    let damage = Math.max(0, totalAttack - totalDefense);

    // Apply typed damage Resistance & Vulnerability
    const dmgType = profile.manaType && profile.manaType !== 'Neutral' ? profile.manaType : null;
    if (dmgType && defender.resistances && defender.resistances[dmgType]) {
      damage = Math.max(0, damage - (defender.resistances[dmgType] || 0));
    }
    if (dmgType && defender.vulnerabilities && defender.vulnerabilities[dmgType]) {
      damage = damage + (defender.vulnerabilities[dmgType] || 0);
    }

    defender.hp = Math.max(0, defender.hp - damage);

    let logMsg = `⚔️ COMBAT: ${attacker.name} attacks ${defender.name}! ATK ${totalAttack} (Base ${baseAtk}${antiBonus > 0 ? ' + Anti-X ' + antiBonus : ''}) - DEF ${totalDefense} = ${damage} Damage.`;
    if (dmgType && (defender.resistances?.[dmgType] || defender.vulnerabilities?.[dmgType])) {
      logMsg += ` (${dmgType} Resist/Vuln applied)`;
    }
    logAction(logMsg);

    if (defender.hp <= 0) {
      logAction(`💥 ${defender.name} captured!`);
      if (profile.captureMovement) {
        attacker.x = defender.x;
        attacker.y = defender.y;
      }
      if (defender.type === 'king' || (defender.unitKeywords || []).includes("Sovereign")) {
        game.phase = 'GAME_OVER';
        game.winner = attacker.owner;
        logAction(`👑 REGICIDE VICTORY! ${attacker.owner.toUpperCase()} WINS THE MATCH!`);
      }
    }
    broadcastStateUpdate();
    updateBoardUI();
  });
}

function handleRotatePiece(rot) {
  const game = appState.game;
  if (!appState.selectedPieceId) return;
  const p = game.piecesMap[appState.selectedPieceId];
  if (p && p.owner === game.activePlayer) {
    p.facing = rot === 'CW' ? (p.facing + 1) % 4 : (p.facing + 3) % 4;
    logAction(`🔄 ${p.name} rotated to face ${FACING_NAMES[p.facing]}.`);
    broadcastStateUpdate();
    updateBoardUI();
  }
}

function handleEndTurn() {
  const game = appState.game;
  if (!game || game.phase === 'GAME_OVER') return;

  if (game.activePlayer === 'white') {
    game.activePlayer = 'black';
    game.activationPoints = 4;
    logAction(`➡️ Black Turn Begins. 4 AP awarded.`);
  } else {
    game.roundNumber++;
    game.activePlayer = 'white';
    game.activationPoints = 4;

    logAction(`----------------------------------------`);
    logAction(`🌟 ROUND ${game.roundNumber} GENERATION PHASE`);

    Object.values(game.piecesMap).forEach(p => p.activatedThisTurn = false);

    const manaRes = calculateGenerationPhaseMana(game.boardGrid, game.piecesMap);
    manaRes.logs.forEach(l => logAction(l));

    game.mana.white = manaRes.whiteMana;
    game.mana.black = manaRes.blackMana;

    const wTot = Object.values(manaRes.whiteMana).reduce((a,b)=>a+b, 0);
    const bTot = Object.values(manaRes.blackMana).reduce((a,b)=>a+b, 0);

    if (wTot === 0 && bTot > 0) game.starvation.white++; else game.starvation.white = 0;
    if (bTot === 0 && wTot > 0) game.starvation.black++; else game.starvation.black = 0;

    if (game.starvation.white >= 2) { game.phase = 'GAME_OVER'; game.winner = 'black'; logAction(`💀 BLACK WINS via Mana Starvation!`); }
    else if (game.starvation.black >= 2) { game.phase = 'GAME_OVER'; game.winner = 'white'; logAction(`💀 WHITE WINS via Mana Starvation!`); }
    else { logAction(`➡️ White Turn Begins. 4 AP awarded.`); }
  }

  appState.selectedPieceId = null;
  broadcastStateUpdate();
  updateBoardUI();
}

function handleKingDraw() {
  const game = appState.game;
  if (game.activationPoints <= 0) return;

  const activeP = game.activePlayer;
  const king = Object.values(game.piecesMap).find(p => p.owner === activeP && p.type === 'king' && p.hp > 0);

  if (!king || king.activatedThisTurn) { logAction(`❌ King unavailable to draw.`); return; }

  const hand = game.hands[activeP];
  if (hand.length >= 7) { logAction(`❌ Hand is full (7 cards).`); return; }

  const deck = game.decks[activeP];
  if (deck.length > 0) {
    const card = deck.shift();
    hand.push(card);
    king.activatedThisTurn = true;
    game.activationPoints--;
    logAction(`👑 King Draw (1 AP): Drawn [${card.name}].`);
  }
  broadcastStateUpdate();
  updateBoardUI();
}

function handleInspectPiece() {
  const game = appState.game;
  if (!appState.selectedPieceId) return;
  const p = game.piecesMap[appState.selectedPieceId];

  const modalContainer = document.getElementById('modalContainer');
  modalContainer.innerHTML = `
    <div class="modal-overlay">
      <div class="modal-content">
        <h2>${p.symbol} ${p.name} Rules Card</h2>
        <p style="color: var(--text-muted); margin-bottom: 12px;">Class: ${p.type.toUpperCase()} • Cost: ${p.pointCost} PTS</p>
        <div style="font-size: 0.9rem; line-height: 1.6;">
          <div>HP: ${p.hp}/${p.maxHP} | Defense: ${p.defense} | Movement: ${p.movement.maxDistance} tiles</div>
          <div>Facing: ${FACING_NAMES[p.facing]}</div>
          <div style="margin-top: 8px;"><strong>Attacks:</strong> ${p.attackProfiles.map(a => `${a.name} (ATK ${a.attackValue}, Range ${a.range})`).join(', ')}</div>
          <div style="margin-top: 8px;"><strong>Abilities:</strong> ${p.abilities.map(a => a.name).join(', ')}</div>
        </div>
        <div style="display: flex; justify-content: flex-end; margin-top: 16px;">
          <button class="btn btn-primary" id="closeInspectBtn">Close</button>
        </div>
      </div>
    </div>
  `;
  document.getElementById('closeInspectBtn').addEventListener('click', () => modalContainer.innerHTML = '');
}

function handleOpenLibrary() {
  const game = appState.game;
  if (!appState.selectedPieceId) return;
  const p = game.piecesMap[appState.selectedPieceId];
  if (!p || p.libraryCapacity <= 0) return;

  const modalContainer = document.getElementById('modalContainer');
  modalContainer.innerHTML = `
    <div class="modal-overlay">
      <div class="modal-content">
        <h2>📚 ${p.name} Library Vault (${p.library.length}/${p.libraryCapacity})</h2>
        <p style="color: var(--text-muted); margin-bottom: 12px;">Stored spells are hidden and do not count toward hand limit.</p>
        <div style="display: flex; justify-content: flex-end; margin-top: 16px;">
          <button class="btn" id="closeLibBtn">Close Vault</button>
        </div>
      </div>
    </div>
  `;
  document.getElementById('closeLibBtn').addEventListener('click', () => modalContainer.innerHTML = '');
}

function handleOpenBalanceEditor() {
  const modalContainer = document.getElementById('modalContainer');
  modalContainer.innerHTML = `
    <div class="modal-overlay">
      <div class="modal-content" style="max-width: 600px;">
        <h2>⚖️ Live Data & Balance Editor</h2>
        <p style="color: var(--text-muted); margin-bottom: 12px;">Edit unit HP, Defense, and Point Costs for testing.</p>
        <div style="display: flex; flex-direction: column; gap: 8px; max-height: 300px; overflow-y: auto;">
          ${Object.keys(appState.customPiecesData).map(k => {
            const unit = appState.customPiecesData[k];
            return `
              <div style="display: flex; align-items: center; justify-content: space-between; background: rgba(0,0,0,0.3); padding: 8px; border-radius: 6px;">
                <span>${unit.symbol} ${unit.name}</span>
                <div style="display: flex; gap: 8px;">
                  <input type="number" class="bal-input" data-key="${k}" data-field="pointCost" value="${unit.pointCost}" style="width: 50px; padding: 2px;" title="Point Cost"> Pts
                  <input type="number" class="bal-input" data-key="${k}" data-field="maxHP" value="${unit.maxHP}" style="width: 50px; padding: 2px;" title="Max HP"> HP
                </div>
              </div>
            `;
          }).join('')}
        </div>
        <div style="display: flex; justify-content: flex-end; margin-top: 16px; gap: 8px;">
          <button class="btn btn-primary" id="saveBalBtn">Save Balance</button>
        </div>
      </div>
    </div>
  `;

  document.querySelectorAll('.bal-input').forEach(inp => {
    inp.addEventListener('change', (e) => {
      const k = e.target.dataset.key;
      const f = e.target.dataset.field;
      appState.customPiecesData[k][f] = parseInt(e.target.value, 10) || 1;
    });
  });

  document.getElementById('saveBalBtn').addEventListener('click', () => {
    modalContainer.innerHTML = '';
    logAction(`⚖️ Live balance parameters updated!`);
    broadcastStateUpdate();
    updateBoardUI();
  });
}

function logAction(msg) {
  if (appState.game) appState.game.combatLogs.push(msg);
}

function loadCustomProjectData() {
  try {
    const customArmySaved = localStorage.getItem("tile_kings_custom_armies_v1");
    const projectSaved = localStorage.getItem("tile_kings_project_v1");

    let customPiecesList = [];
    if (projectSaved) {
      const proj = JSON.parse(projectSaved);
      if (proj && Array.isArray(proj.pieces)) {
        customPiecesList = proj.pieces;
      }
    }

    if (customArmySaved) {
      const armyData = JSON.parse(customArmySaved);
      if (armyData && armyData.pieces) {
        customPiecesList = armyData.pieces;
      }
      if (armyData && armyData.config) {
        ARMY_PRESETS.custom = {
          name: armyData.name || 'Custom Designer Army',
          config: armyData.config
        };
      }
    }

    if (customPiecesList.length > 0) {
      customPiecesList.forEach(p => {
        const key = p.id || p.name.toLowerCase().replace(/\s+/g, '_');
        appState.customPiecesData[key] = {
          id: p.id || key,
          name: p.name || 'Custom Piece',
          symbol: p.symbol || '🛡️',
          iconUrl: p.iconUrl || '',
          pointCost: p.pointsCost ?? 1,
          maxHP: p.maxHp ?? 1,
          defense: p.defense ?? 0,
          unitKeywords: p.unitKeywords || (p.isKingEquivalent ? ["Sovereign", "Royal"] : ["Infantry"]),
          resistances: p.resistances || { Fire: 0, Earth: 0, Water: 0, Air: 0 },
          vulnerabilities: p.vulnerabilities || { Fire: 0, Earth: 0, Water: 0, Air: 0 },
          immunities: p.immunities || [],
          movement: {
            type: 'omni',
            maxDistance: parseInt(p.movementText) || 3,
            maneuversPerActivation: p.maneuverCount || 1,
            passthroughFriendly: p.movementProperties?.passFriendly || false,
            passthroughEnemy: p.movementProperties?.passEnemy || false
          },
          activationSequence: p.activationSequence || ['MOVE_THEN_ATTACK'],
          libraryCapacity: p.libraryCapacity || 0,
          attackProfiles: (p.attacks || []).map(a => ({
            id: a.id || 'atk_1',
            name: a.name || 'Strike',
            pattern: 'front_line',
            range: a.rangeMax || 1,
            attackValue: parseInt(a.attackValue) || 3,
            antiKeywords: a.antiKeywords || [],
            manaType: a.manaType || 'Neutral',
            captureMovement: a.canAdvanceOnCapture ?? true,
            knockback: a.knockback || 0
          })),
          abilities: p.abilities || []
        };
      });
    }
  } catch(e) {
    console.warn("Could not load custom project data:", e);
  }
}

// Initialize Application
window.addEventListener('DOMContentLoaded', () => {
  loadCustomProjectData();
  renderHomeScreen();
});
