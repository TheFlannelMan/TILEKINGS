/**
 * Tile Kings Visual Grid Editor & SVG Diagram Generator
 * Supports facing-relative Movement Grids & Attack Pattern Grids
 */

export const MOVE_TILE_STATES = {
  none: { label: "Empty", color: "#1f2937", border: "#374151" },
  legal: { label: "Legal Move", color: "#059669", border: "#34d399", symbol: "✓" },
  path: { label: "Path Tile", color: "#2563eb", border: "#60a5fa", symbol: "•" },
  conditional: { label: "Conditional", color: "#d97706", border: "#fbbf24", symbol: "?" },
  forbidden: { label: "Forbidden", color: "#dc2626", border: "#f87171", symbol: "✕" },
  jump: { label: "Jump Target", color: "#7c3aed", border: "#c084fc", symbol: "⤾" }
};

export const ATTACK_TILE_STATES = {
  none: { label: "Empty", color: "#1f2937", border: "#374151" },
  target: { label: "Targetable", color: "#dc2626", border: "#f87171", symbol: "🎯" },
  aoe: { label: "AOE Square", color: "#ea580c", border: "#fb923c", symbol: "💥" },
  conditional: { label: "Conditional", color: "#d97706", border: "#fbbf24", symbol: "⚡" }
};

export class GridEditor {
  constructor(containerEl, options = {}) {
    this.containerEl = containerEl;
    this.gridSize = options.gridSize || 11;
    this.center = Math.floor(this.gridSize / 2); // (5,5)
    this.mode = options.mode || "movement"; // "movement" or "attack"
    this.activeTool = options.activeTool || (this.mode === "movement" ? "legal" : "target");
    this.gridMap = options.gridMap || {}; // {"row,col": stateKey}
    this.onChange = options.onChange || (() => {});
    
    this.initUI();
  }

  setMode(mode, activeTool = null) {
    this.mode = mode;
    this.activeTool = activeTool || (mode === "movement" ? "legal" : "target");
    this.renderPalette();
  }

  setGridMap(gridMap) {
    this.gridMap = gridMap || {};
    this.renderGrid();
  }

  initUI() {
    this.containerEl.innerHTML = `
      <div class="grid-editor-wrapper">
        <div class="grid-editor-toolbar">
          <div class="grid-facing-badge">
            <span class="facing-arrow">▲</span> FACING: NORTH (UP)
          </div>
          <div class="grid-tool-palette" id="gridToolPalette"></div>
          <button class="btn-clear-grid" id="btnClearGrid">Clear Grid</button>
        </div>
        <div class="grid-board-canvas" id="gridBoardCanvas"></div>
      </div>
    `;

    this.paletteEl = this.containerEl.querySelector("#gridToolPalette");
    this.canvasEl = this.containerEl.querySelector("#gridBoardCanvas");
    this.clearBtn = this.containerEl.querySelector("#btnClearGrid");

    this.clearBtn.addEventListener("click", () => {
      this.gridMap = {};
      this.renderGrid();
      this.onChange(this.gridMap);
    });

    this.renderPalette();
    this.renderGrid();
  }

  renderPalette() {
    const states = this.mode === "movement" ? MOVE_TILE_STATES : ATTACK_TILE_STATES;
    this.paletteEl.innerHTML = Object.entries(states)
      .filter(([key]) => key !== "none")
      .map(([key, info]) => `
        <button class="tool-btn ${this.activeTool === key ? 'active' : ''}" data-tool="${key}" style="border-color: ${info.border};">
          <span class="tool-dot" style="background: ${info.color}"></span>
          ${info.label}
        </button>
      `).join("");

    this.paletteEl.querySelectorAll(".tool-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        this.activeTool = e.currentTarget.dataset.tool;
        this.renderPalette();
      });
    });
  }

  renderGrid() {
    let html = `<div class="grid-matrix" style="grid-template-columns: repeat(${this.gridSize}, 1fr);">`;

    for (let r = 0; r < this.gridSize; r++) {
      for (let c = 0; c < this.gridSize; c++) {
        const isCenter = (r === this.center && c === this.center);
        const key = `${r},${c}`;
        const stateKey = this.gridMap[key] || "none";
        const states = this.mode === "movement" ? MOVE_TILE_STATES : ATTACK_TILE_STATES;
        const stateInfo = states[stateKey] || states.none;

        let cellContent = "";
        let cellClass = "grid-cell";

        if (isCenter) {
          cellClass += " center-piece";
          cellContent = `<span class="piece-facing-icon">▲</span>`;
        } else if (stateKey !== "none") {
          cellClass += ` state-${stateKey}`;
          cellContent = `<span class="tile-symbol">${stateInfo.symbol || ""}</span>`;
        }

        html += `
          <div class="${cellClass}" 
               data-row="${r}" 
               data-col="${c}" 
               style="background-color: ${isCenter ? '#0284c7' : stateInfo.color}; border-color: ${isCenter ? '#38bdf8' : stateInfo.border};">
            ${cellContent}
          </div>
        `;
      }
    }

    html += `</div>`;
    this.canvasEl.innerHTML = html;

    // Attach cell click handlers
    this.canvasEl.querySelectorAll(".grid-cell").forEach(cell => {
      cell.addEventListener("click", (e) => {
        const r = parseInt(cell.dataset.row);
        const c = parseInt(cell.dataset.col);
        if (r === this.center && c === this.center) return; // Cannot edit piece center tile

        const key = `${r},${c}`;
        const current = this.gridMap[key];

        if (current === this.activeTool) {
          delete this.gridMap[key];
        } else {
          this.gridMap[key] = this.activeTool;
        }

        this.renderGrid();
        this.onChange(this.gridMap);
      });
    });
  }
}

/**
 * Generates an SVG string representation of a movement/attack grid for embedding in printed cards.
 */
export function renderPatternSVG(gridMap = {}, mode = "movement", width = 140, height = 140) {
  const size = 11;
  const center = 5;
  const cellSize = width / size;
  const states = mode === "movement" ? MOVE_TILE_STATES : ATTACK_TILE_STATES;

  let svgCells = "";

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const isCenter = (r === center && c === center);
      const key = `${r},${c}`;
      const stateKey = gridMap[key] || "none";
      const info = states[stateKey] || states.none;

      const x = c * cellSize;
      const y = r * cellSize;

      let fill = isCenter ? "#0284c7" : (stateKey !== "none" ? info.color : "#111827");
      let stroke = isCenter ? "#38bdf8" : (stateKey !== "none" ? info.border : "#374151");

      svgCells += `<rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" fill="${fill}" stroke="${stroke}" stroke-width="0.5"/>`;

      if (isCenter) {
        // Arrow pointing North
        const cx = x + cellSize / 2;
        const cy = y + cellSize / 2;
        svgCells += `<path d="M ${cx} ${y + 2} L ${x + cellSize - 3} ${y + cellSize - 3} L ${x + 3} ${y + cellSize - 3} Z" fill="#ffffff"/>`;
      } else if (stateKey !== "none") {
        const cx = x + cellSize / 2;
        const cy = y + cellSize / 2;
        svgCells += `<circle cx="${cx}" cy="${cy}" r="${cellSize * 0.25}" fill="${info.border}"/>`;
      }
    }
  }

  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <rect width="${width}" height="${height}" fill="#0f172a" rx="4" />
      ${svgCells}
    </svg>
  `;
}
