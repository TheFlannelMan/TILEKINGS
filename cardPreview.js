/**
 * Tile Kings Live Card Preview Renderer & PNG Card Exporter
 * Renders physical board game cards with dynamic section hiding for high readability
 */

import { renderPatternSVG } from "./gridEditor.js";
import { formatActivationSequence } from "./activationBuilder.js";

export class CardPreview {
  constructor(containerEl) {
    this.containerEl = containerEl;
  }

  render(piece) {
    if (!piece) {
      this.containerEl.innerHTML = `<div class="card-preview-empty">Select or create a piece to view card preview.</div>`;
      return;
    }

    const moveSvg = renderPatternSVG(piece.movementGrid, "movement", 130, 130);
    const mainAttack = piece.attacks && piece.attacks[0];
    const attackSvg = mainAttack ? renderPatternSVG(mainAttack.patternGrid, "attack", 130, 130) : "";

    const activationText = formatActivationSequence(piece.activationSequence);

    // Dynamic Section Hiding checks
    const hasAbilities = piece.abilities && piece.abilities.length > 0;
    const hasTerrain = piece.terrainAffinities && piece.terrainAffinities.length > 0;
    const hasLibrary = piece.hasLibrary && piece.libraryCapacity > 0;
    const hasManaStorage = piece.canStoreMana && piece.manaCapacity > 0;
    const hasAuras = piece.auras && piece.auras.length > 0;
    const hasTags = piece.tags && piece.tags.length > 0;

    let html = `
      <div class="tile-kings-card-frame" id="tileKingsCardFrame">
        <!-- CARD HEADER -->
        <div class="card-header">
          <div class="card-title-group">
            ${piece.isKingEquivalent ? '<span class="king-badge" title="King Equivalent">👑</span>' : ''}
            <h2 class="card-name">${escapeHTML(piece.name || "Unnamed Piece")}</h2>
            <div class="card-subtitle">${escapeHTML(piece.subtitle || "Unit")} ${piece.faction ? '• ' + escapeHTML(piece.faction) : ''}</div>
          </div>
          <div class="card-cost-badge">
            <span class="cost-num">${piece.pointsCost ?? 0}</span>
            <span class="cost-lbl">PTS</span>
          </div>
        </div>

        <!-- CORE STATS STRIP -->
        <div class="card-stats-strip">
          <div class="stat-pill hp">
            <span class="stat-lbl">HP</span>
            <span class="stat-val">${piece.maxHp ?? 1}</span>
            ${piece.healthDie ? `<span class="die-sub">${escapeHTML(piece.healthDie)}</span>` : ''}
          </div>
          <div class="stat-pill def">
            <span class="stat-lbl">DEF</span>
            <span class="stat-val">${piece.defense ?? 0}</span>
          </div>
          <div class="stat-pill mov">
            <span class="stat-lbl">MOV</span>
            <span class="stat-val">${escapeHTML(String(piece.movementText ?? "0"))}</span>
          </div>
          <div class="stat-pill man">
            <span class="stat-lbl">MAN</span>
            <span class="stat-val">${escapeHTML(String(piece.maneuverText ?? "1"))}</span>
          </div>
        </div>

        <!-- VISUAL PATTERNS & ACTIVATION BANNER -->
        <div class="card-diagrams-row">
          <div class="diagram-box">
            <div class="diagram-title">MOVEMENT PATTERN</div>
            <div class="diagram-svg-container">${moveSvg}</div>
          </div>
          ${attackSvg ? `
            <div class="diagram-box">
              <div class="diagram-title">ATTACK PATTERN</div>
              <div class="diagram-svg-container">${attackSvg}</div>
            </div>
          ` : ''}
        </div>

        <!-- ACTIVATION BANNER -->
        <div class="card-activation-banner">
          <span class="act-icon">⚡</span>
          <span class="act-label">SEQUENCE:</span>
          <span class="act-value">${escapeHTML(activationText)}</span>
        </div>

        <!-- ATTACK PROFILES -->
        <div class="card-section attacks-section">
          <div class="section-header">ATTACKS</div>
          ${(!piece.attacks || piece.attacks.length === 0) ? '<div class="no-entry">No Attacks</div>' : ''}
          ${(piece.attacks || []).map(atk => `
            <div class="attack-card-entry">
              <div class="atk-head">
                <span class="atk-name">⚔️ ${escapeHTML(atk.name || "Attack")}</span>
                <span class="atk-stat-tag">ATK: <strong>${escapeHTML(String(atk.attackValue ?? "0"))}</strong></span>
                <span class="atk-stat-tag">RNG: <strong>${atk.rangeMin === atk.rangeMax ? atk.rangeMin : atk.rangeMin + '-' + atk.rangeMax}</strong></span>
                ${atk.manaCost > 0 ? `<span class="atk-mana-tag">💧 ${atk.manaCost} ${escapeHTML(atk.manaType)}</span>` : ''}
              </div>
              <div class="atk-body">
                ${atk.rulesText ? `<div class="atk-rules">${escapeHTML(atk.rulesText)}</div>` : ''}
                <div class="atk-meta-flags">
                  ${atk.canAdvanceOnCapture ? '<span class="flag-tag">Advance on Capture</span>' : ''}
                  ${atk.knockback > 0 ? `<span class="flag-tag">Knockback ${atk.knockback}</span>` : ''}
                  ${atk.statusInflicted ? `<span class="flag-tag status">Inflicts ${escapeHTML(atk.statusInflicted)}</span>` : ''}
                </div>
              </div>
            </div>
          `).join("")}
        </div>

        <!-- PASSIVE & ACTIVE ABILITIES (Hides if empty) -->
        ${hasAbilities ? `
          <div class="card-section abilities-section">
            <div class="section-header">ABILITIES</div>
            ${piece.abilities.map(abil => `
              <div class="ability-card-entry">
                <div class="abil-head">
                  <strong>${escapeHTML(abil.name || "Ability")}</strong> 
                  <span class="abil-type">[${escapeHTML(abil.type || "Passive")}]</span>
                  ${abil.cost ? `<span class="abil-cost">${escapeHTML(abil.cost)}</span>` : ''}
                </div>
                <div class="abil-text">${escapeHTML(abil.text || abil.effect || "")}</div>
              </div>
            `).join("")}
          </div>
        ` : ''}

        <!-- TERRAIN AFFINITIES & AURAS (Hides if empty) -->
        ${(hasTerrain || hasAuras) ? `
          <div class="card-section terrain-auras-section">
            ${hasTerrain ? `
              <div class="sub-section">
                <span class="sub-header">TERRAIN AFFINITIES:</span>
                ${piece.terrainAffinities.map(t => `<span class="terrain-chip">${escapeHTML(t.terrain)}: ${escapeHTML(t.effect)}</span>`).join(" ")}
              </div>
            ` : ''}
            ${hasAuras ? `
              <div class="sub-section">
                <span class="sub-header">AURAS:</span>
                ${piece.auras.map(a => `<span class="aura-chip">${escapeHTML(a.name || 'Aura')} (R:${a.radius}): ${escapeHTML(a.effect)}</span>`).join(" ")}
              </div>
            ` : ''}
          </div>
        ` : ''}

        <!-- LIBRARY & MANA STORAGE (Hides if empty) -->
        ${(hasLibrary || hasManaStorage) ? `
          <div class="card-section storage-section">
            ${hasLibrary ? `
              <div class="storage-badge">
                📚 <strong>Library Capacity: ${piece.libraryCapacity}</strong>
                ${piece.libraryNotes ? `<span class="storage-note">(${escapeHTML(piece.libraryNotes)})</span>` : ''}
              </div>
            ` : ''}
            ${hasManaStorage ? `
              <div class="storage-badge">
                🔮 <strong>Mana Storage: ${piece.manaCapacity}</strong>
                ${piece.manaStorageNotes ? `<span class="storage-note">(${escapeHTML(piece.manaStorageNotes)})</span>` : ''}
              </div>
            ` : ''}
          </div>
        ` : ''}

        <!-- FOOTER: TAGS & FLAVOR -->
        <div class="card-footer">
          ${hasTags ? `
            <div class="card-tags-row">
              ${piece.tags.map(tag => `<span class="card-tag">#${escapeHTML(tag)}</span>`).join("")}
              ${piece.healthTrackingType ? `<span class="card-tag track-type">Mode: ${escapeHTML(piece.healthTrackingType)}</span>` : ''}
            </div>
          ` : ''}
          ${piece.description ? `<div class="card-flavor">"${escapeHTML(piece.description)}"</div>` : ''}
        </div>
      </div>

      <!-- CARD ACTION CONTROLS -->
      <div class="card-preview-actions">
        <button class="btn-card-action export-png" id="btnExportPNG">
          <span>📷</span> Export High-Res PNG
        </button>
        <button class="btn-card-action print-card" id="btnPrintCard">
          <span>📄</span> Print Card
        </button>
      </div>
    `;

    this.containerEl.innerHTML = html;

    // Attach export handlers
    this.containerEl.querySelector("#btnExportPNG")?.addEventListener("click", () => {
      exportCardPNG(piece);
    });

    this.containerEl.querySelector("#btnPrintCard")?.addEventListener("click", () => {
      window.print();
    });
  }
}

/**
 * High-Resolution Canvas PNG Exporter for Tile Kings Cards
 */
export function exportCardPNG(piece) {
  const width = 700;
  const height = 1040;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");

  // Dark card background frame
  ctx.fillStyle = "#0f172a";
  ctx.beginPath();
  ctx.roundRect(0, 0, width, height, 24);
  ctx.fill();

  ctx.strokeStyle = "#38bdf8";
  ctx.lineWidth = 6;
  ctx.stroke();

  // Header Banner
  ctx.fillStyle = "#1e293b";
  ctx.beginPath();
  ctx.roundRect(20, 20, width - 40, 100, 12);
  ctx.fill();

  // Title
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 34px sans-serif";
  ctx.fillText(piece.name || "Unnamed Piece", 40, 65);

  // Subtitle
  ctx.fillStyle = "#94a3b8";
  ctx.font = "20px sans-serif";
  ctx.fillText(`${piece.subtitle || "Unit"} • Cost: ${piece.pointsCost ?? 0} PTS`, 40, 98);

  // Cost Badge Top Right
  ctx.fillStyle = "#0284c7";
  ctx.beginPath();
  ctx.arc(width - 70, 70, 35, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 28px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(`${piece.pointsCost ?? 0}`, width - 70, 78);
  ctx.textAlign = "left";

  // Stats Strip (HP, DEF, MOV, MAN)
  const stats = [
    { label: "HP", val: `${piece.maxHp ?? 1} (${piece.healthDie || ''})`, color: "#dc2626" },
    { label: "DEF", val: `${piece.defense ?? 0}`, color: "#059669" },
    { label: "MOV", val: `${piece.movementText ?? 0}`, color: "#0284c7" },
    { label: "MAN", val: `${piece.maneuverText ?? 1}`, color: "#d97706" }
  ];

  const pillW = (width - 60) / 4;
  stats.forEach((st, i) => {
    const px = 20 + i * pillW + 5;
    ctx.fillStyle = "#1e293b";
    ctx.beginPath();
    ctx.roundRect(px, 135, pillW - 10, 60, 8);
    ctx.fill();
    ctx.strokeStyle = st.color;
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = st.color;
    ctx.font = "bold 16px sans-serif";
    ctx.fillText(st.label, px + 12, 160);

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 18px sans-serif";
    ctx.fillText(st.val, px + 12, 184);
  });

  // Activation sequence banner
  const actText = formatActivationSequence(piece.activationSequence);
  ctx.fillStyle = "#334155";
  ctx.beginPath();
  ctx.roundRect(20, 210, width - 40, 45, 8);
  ctx.fill();
  ctx.fillStyle = "#38bdf8";
  ctx.font = "bold 16px sans-serif";
  ctx.fillText("SEQUENCE: " + actText, 35, 238);

  // Render SVG Diagrams onto Canvas image
  const moveSvg = renderPatternSVG(piece.movementGrid, "movement", 240, 240);
  const imgMove = new Image();
  imgMove.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(moveSvg);

  imgMove.onload = () => {
    ctx.drawImage(imgMove, 40, 275, 280, 280);

    // Section Titles for Diagrams
    ctx.fillStyle = "#94a3b8";
    ctx.font = "bold 16px sans-serif";
    ctx.fillText("MOVEMENT PATTERN", 40, 270);

    if (piece.attacks && piece.attacks[0]) {
      const atkSvg = renderPatternSVG(piece.attacks[0].patternGrid, "attack", 240, 240);
      const imgAtk = new Image();
      imgAtk.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(atkSvg);
      imgAtk.onload = () => {
        ctx.drawImage(imgAtk, 380, 275, 280, 280);
        ctx.fillText("ATTACK PATTERN", 380, 270);
        finishCanvasExport();
      };
    } else {
      finishCanvasExport();
    }
  };

  function finishCanvasExport() {
    // Attack Profiles Listing
    ctx.fillStyle = "#f87171";
    ctx.font = "bold 22px sans-serif";
    ctx.fillText("ATTACKS", 35, 600);

    let curY = 630;
    (piece.attacks || []).forEach(atk => {
      ctx.fillStyle = "#1e293b";
      ctx.beginPath();
      ctx.roundRect(20, curY, width - 40, 90, 8);
      ctx.fill();

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 20px sans-serif";
      ctx.fillText(`⚔️ ${atk.name || 'Attack'}`, 35, curY + 32);

      ctx.fillStyle = "#fbbf24";
      ctx.font = "18px sans-serif";
      ctx.fillText(`ATK: ${atk.attackValue || 0}   RNG: ${atk.rangeMin}-${atk.rangeMax}`, 35, curY + 60);

      if (atk.rulesText) {
        ctx.fillStyle = "#cbd5e1";
        ctx.font = "15px sans-serif";
        ctx.fillText(atk.rulesText, 35, curY + 80);
      }
      curY += 105;
    });

    // Abilities if present
    if (piece.abilities && piece.abilities.length > 0) {
      ctx.fillStyle = "#60a5fa";
      ctx.font = "bold 22px sans-serif";
      ctx.fillText("ABILITIES", 35, curY + 15);
      curY += 40;
      piece.abilities.forEach(ab => {
        ctx.fillStyle = "#cbd5e1";
        ctx.font = "16px sans-serif";
        ctx.fillText(`• ${ab.name}: ${ab.text || ab.effect || ''}`, 35, curY);
        curY += 25;
      });
    }

    // Trigger image download
    const link = document.createElement("a");
    link.download = `${(piece.name || "card").toLowerCase().replace(/\s+/g, "_")}_card.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }
}

function escapeHTML(str) {
  if (typeof str !== "string") return str;
  return str.replace(/[&<>'"]/g, 
    tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
  );
}
