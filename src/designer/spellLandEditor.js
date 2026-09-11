/**
 * Tile Kings Spell & Land Designer Extension Components
 */

export class LandEditor {
  constructor(containerEl, store, onUpdate = () => {}) {
    this.containerEl = containerEl;
    this.store = store;
    this.onUpdate = onUpdate;
  }

  render() {
    const land = this.store.getActiveLand();
    if (!land) {
      this.containerEl.innerHTML = `<div class="empty-notice">Select or create a Land Card to edit.</div>`;
      return;
    }

    this.containerEl.innerHTML = `
      <div class="designer-form-wrapper">
        <h3 class="form-section-title">🌍 Land Card Properties</h3>
        <div class="form-grid-2">
          <div class="form-group">
            <label>Land Name:</label>
            <input type="text" id="landName" value="${escapeAttr(land.name)}" />
          </div>
          <div class="form-group">
            <label>Element:</label>
            <select id="landElement">
              ${["Fire", "Earth", "Water", "Air", "Neutral"].map(el => `<option value="${el}" ${land.element === el ? 'selected' : ''}>${el}</option>`).join("")}
            </select>
          </div>
          <div class="form-group">
            <label>Tile Count (e.g. 4):</label>
            <input type="number" id="landTileCount" value="${land.tileCount || 4}" min="1" max="16" />
          </div>
          <div class="form-group">
            <label>Placement Shape Rule:</label>
            <select id="landShapeRule">
              <option value="Flexible Connected" ${land.placementShape === "Flexible Connected" ? 'selected' : ''}>Flexible Connected (Orthogonal)</option>
              <option value="Fixed Pattern" ${land.placementShape === "Fixed Pattern" ? 'selected' : ''}>Fixed Pattern</option>
            </select>
          </div>
        </div>

        <div class="form-group">
          <label>Allowed Overwrites:</label>
          <input type="text" id="landOverwrites" value="${escapeAttr(land.allowedOverwrites || 'Neutral only')}" placeholder="e.g. Neutral and Earth" />
        </div>

        <div class="form-group">
          <label>Terrain Effects granted to pieces on this land:</label>
          <input type="text" id="landEffects" value="${escapeAttr(land.terrainEffects || '')}" placeholder="e.g. Friendly pieces gain +1 Defense" />
        </div>

        <div class="form-group">
          <label>Rules Text:</label>
          <textarea id="landRules" rows="3">${escapeHTML(land.rulesText || '')}</textarea>
        </div>

        <h4 class="form-subsection-title">Fixed Placement Pattern (Polyomino Grid)</h4>
        <div class="polyomino-editor-container" id="polyominoGrid"></div>
      </div>
    `;

    this.attachListeners(land);
    this.renderPolyominoGrid(land);
  }

  attachListeners(land) {
    const bind = (id, key, isNum = false) => {
      this.containerEl.querySelector(`#${id}`)?.addEventListener("input", (e) => {
        land[key] = isNum ? parseInt(e.target.value) || 0 : e.target.value;
        this.store.save();
        this.onUpdate();
      });
    };

    bind("landName", "name");
    bind("landElement", "element");
    bind("landTileCount", "tileCount", true);
    bind("landShapeRule", "placementShape");
    bind("landOverwrites", "allowedOverwrites");
    bind("landEffects", "terrainEffects");
    bind("landRules", "rulesText");
  }

  renderPolyominoGrid(land) {
    const gridContainer = this.containerEl.querySelector("#polyominoGrid");
    if (!gridContainer) return;

    land.shapeGrid = land.shapeGrid || { "2,2": true, "2,3": true, "3,2": true, "3,3": true };
    const size = 5;
    let html = `<div class="polyomino-matrix" style="grid-template-columns: repeat(${size}, 1fr);">`;

    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        const key = `${r},${c}`;
        const active = !!land.shapeGrid[key];
        html += `
          <div class="poly-cell ${active ? 'active' : ''}" data-key="${key}">
            ${active ? '🟩' : ''}
          </div>
        `;
      }
    }
    html += `</div>`;
    gridContainer.innerHTML = html;

    gridContainer.querySelectorAll(".poly-cell").forEach(cell => {
      cell.addEventListener("click", (e) => {
        const key = e.currentTarget.dataset.key;
        if (land.shapeGrid[key]) {
          delete land.shapeGrid[key];
        } else {
          land.shapeGrid[key] = true;
        }
        this.store.save();
        this.renderPolyominoGrid(land);
        this.onUpdate();
      });
    });
  }
}

export class SpellEditor {
  constructor(containerEl, store, onUpdate = () => {}) {
    this.containerEl = containerEl;
    this.store = store;
    this.onUpdate = onUpdate;
  }

  render() {
    const spell = this.store.getActiveSpell();
    if (!spell) {
      this.containerEl.innerHTML = `<div class="empty-notice">Select or create a Spell Card to edit.</div>`;
      return;
    }

    this.containerEl.innerHTML = `
      <div class="designer-form-wrapper">
        <h3 class="form-section-title">✨ Spell Card Properties</h3>
        <div class="form-grid-2">
          <div class="form-group">
            <label>Spell Name:</label>
            <input type="text" id="spName" value="${escapeAttr(spell.name)}" />
          </div>
          <div class="form-group">
            <label>Element / Mana Identity:</label>
            <select id="spElement">
              ${["Fire", "Earth", "Water", "Air", "Neutral"].map(el => `<option value="${el}" ${spell.element === el ? 'selected' : ''}>${el}</option>`).join("")}
            </select>
          </div>
          <div class="form-group">
            <label>Mana Cost:</label>
            <input type="number" id="spManaCost" value="${spell.manaCost ?? 1}" min="0" />
          </div>
          <div class="form-group">
            <label>Activation Cost (AP):</label>
            <input type="number" id="spApCost" value="${spell.apCost ?? 1}" min="0" />
          </div>
          <div class="form-group">
            <label>Casting Timing:</label>
            <select id="spTiming">
              ${["Own Turn", "Reaction", "Attack Response", "Movement Response", "Terrain Response", "Start of Round", "End of Round", "Custom"].map(t => `<option value="${t}" ${spell.timing === t ? 'selected' : ''}>${t}</option>`).join("")}
            </select>
          </div>
          <div class="form-group">
            <label>Range:</label>
            <input type="number" id="spRange" value="${spell.range ?? 3}" min="0" />
          </div>
        </div>

        <div class="form-group">
          <label>Target:</label>
          <input type="text" id="spTarget" value="${escapeAttr(spell.target || '')}" placeholder="e.g. Single enemy unit" />
        </div>

        <div class="form-group">
          <label>Spell Effect:</label>
          <textarea id="spEffect" rows="3">${escapeHTML(spell.effect || '')}</textarea>
        </div>

        <div class="form-group">
          <label>Rules Text / Requirements:</label>
          <textarea id="spRules" rows="2">${escapeHTML(spell.rulesText || '')}</textarea>
        </div>
      </div>
    `;

    this.attachListeners(spell);
  }

  attachListeners(spell) {
    const bind = (id, key, isNum = false) => {
      this.containerEl.querySelector(`#${id}`)?.addEventListener("input", (e) => {
        spell[key] = isNum ? parseInt(e.target.value) || 0 : e.target.value;
        this.store.save();
        this.onUpdate();
      });
    };

    bind("spName", "name");
    bind("spElement", "element");
    bind("spManaCost", "manaCost", true);
    bind("spApCost", "apCost", true);
    bind("spTiming", "timing");
    bind("spRange", "range", true);
    bind("spTarget", "target");
    bind("spEffect", "effect");
    bind("spRules", "rulesText");
  }
}

function escapeAttr(str) {
  if (typeof str !== "string") return "";
  return str.replace(/"/g, "&quot;");
}

function escapeHTML(str) {
  if (typeof str !== "string") return "";
  return str.replace(/[&<>'"]/g, tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag));
}
