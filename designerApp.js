/**
 * Tile Kings Visual Card & Piece Designer - Main UI Controller
 */

import { ProjectStore, HEALTH_PRESETS, createBlankPiece } from "./store.js";
import { GridEditor } from "./gridEditor.js";
import { ActivationBuilder } from "./activationBuilder.js";
import { CardPreview } from "./cardPreview.js";
import { LandEditor, SpellEditor } from "./spellLandEditor.js";

export class DesignerApp {
  constructor(containerEl) {
    this.containerEl = containerEl;
    this.store = new ProjectStore();
    this.activeTab = "basics"; // "basics", "stats", "movement", "activation", "attacks", "abilities", "special", "notes"
    
    this.initLayout();
  }

  initLayout() {
    this.containerEl.innerHTML = `
      <div class="designer-app-wrapper">
        <!-- TOP TOOLBAR -->
        <div class="designer-topbar">
          <div class="topbar-brand">
            <span class="brand-icon">🎨</span>
            <strong>TILE KINGS DESIGNER</strong>
            <span class="rules-badge">${this.store.project.rulesVersion}</span>
          </div>
          <div class="topbar-project-info">
            <label>Project:</label>
            <input type="text" id="projectNameInput" class="project-name-input" value="${escapeAttr(this.store.project.projectInfo.name)}" />
          </div>
          <div class="topbar-actions">
            <button class="btn-topbar" id="btnNewPiece">➕ New Piece</button>
            <button class="btn-topbar" id="btnExportProject">💾 Export JSON</button>
            <button class="btn-topbar" id="btnImportProject">📂 Import JSON</button>
            <input type="file" id="fileImportInput" accept=".json" style="display:none;" />
          </div>
        </div>

        <!-- 3-COLUMN DESKTOP WORKSPACE -->
        <div class="designer-workspace">
          <!-- LEFT SIDEBAR (CARD LIBRARY) -->
          <div class="designer-sidebar" id="designerSidebar">
            <div class="sidebar-search">
              <input type="text" id="librarySearch" placeholder="Search cards..." />
            </div>
            <div class="sidebar-card-types">
              <button class="type-tab active" data-type="piece">Pieces (${this.store.project.pieces.length})</button>
              <button class="type-tab" data-type="spell">Spells (${this.store.project.spells.length})</button>
              <button class="type-tab" data-type="land">Lands (${this.store.project.lands.length})</button>
            </div>
            <div class="sidebar-item-list" id="sidebarItemList"></div>
          </div>

          <!-- CENTER WORKSPACE (EDITOR FORMS) -->
          <div class="designer-center-editor" id="designerCenterEditor">
            <div class="editor-tabs-bar" id="editorTabsBar">
              <button class="tab-btn active" data-tab="basics">Basics</button>
              <button class="tab-btn" data-tab="stats">HP & Stats</button>
              <button class="tab-btn" data-tab="movement">Movement Grid</button>
              <button class="tab-btn" data-tab="activation">Activation</button>
              <button class="tab-btn" data-tab="attacks">Attacks</button>
              <button class="tab-btn" data-tab="abilities">Abilities</button>
              <button class="tab-btn" data-tab="special">Library & Mana</button>
              <button class="tab-btn" data-tab="notes">Notes</button>
            </div>
            <div class="editor-content-panel" id="editorContentPanel"></div>
          </div>

          <!-- RIGHT PANEL (LIVE CARD PREVIEW) -->
          <div class="designer-right-preview" id="designerRightPreview">
            <div class="preview-panel-header">
              <h3>LIVE CARD PREVIEW</h3>
            </div>
            <div class="preview-card-mount" id="previewCardMount"></div>
          </div>
        </div>
      </div>
    `;

    this.cardPreview = new CardPreview(this.containerEl.querySelector("#previewCardMount"));
    this.attachTopbarListeners();
    this.renderSidebar();
    this.renderCenterEditor();
    this.updatePreview();
  }

  attachTopbarListeners() {
    const projInput = this.containerEl.querySelector("#projectNameInput");
    projInput.addEventListener("input", (e) => {
      this.store.project.projectInfo.name = e.target.value;
      this.store.save();
    });

    this.containerEl.querySelector("#btnNewPiece").addEventListener("click", () => {
      const piece = this.store.addPiece();
      this.renderSidebar();
      this.renderCenterEditor();
      this.updatePreview();
    });

    this.containerEl.querySelector("#btnExportProject").addEventListener("click", () => {
      const json = this.store.exportProjectJSON();
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${this.store.project.projectInfo.name.toLowerCase().replace(/\s+/g, '_')}.json`;
      a.click();
    });

    const fileInput = this.containerEl.querySelector("#fileImportInput");
    this.containerEl.querySelector("#btnImportProject").addEventListener("click", () => {
      fileInput.click();
    });

    fileInput.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (evt) => {
          const res = this.store.importProjectJSON(evt.target.result);
          if (res.success) {
            this.renderSidebar();
            this.renderCenterEditor();
            this.updatePreview();
            alert("Project imported successfully!");
          } else {
            alert("Import failed: " + res.error);
          }
        };
        reader.readAsText(file);
      }
    });

    // Sidebar search & card type tabs
    const searchInp = this.containerEl.querySelector("#librarySearch");
    searchInp.addEventListener("input", () => this.renderSidebar());

    this.containerEl.querySelectorAll(".sidebar-card-types .type-tab").forEach(tab => {
      tab.addEventListener("click", (e) => {
        this.containerEl.querySelectorAll(".sidebar-card-types .type-tab").forEach(t => t.classList.remove("active"));
        e.currentTarget.classList.add("active");
        this.store.activeCardType = e.currentTarget.dataset.type;
        if (this.store.activeCardType === "piece") {
          this.store.activeCardId = this.store.project.pieces[0]?.id || null;
        } else if (this.store.activeCardType === "spell") {
          this.store.activeCardId = this.store.project.spells[0]?.id || null;
        } else if (this.store.activeCardType === "land") {
          this.store.activeCardId = this.store.project.lands[0]?.id || null;
        }
        this.renderSidebar();
        this.renderCenterEditor();
        this.updatePreview();
      });
    });

    // Center tab switcher
    this.containerEl.querySelectorAll("#editorTabsBar .tab-btn").forEach(tab => {
      tab.addEventListener("click", (e) => {
        this.containerEl.querySelectorAll("#editorTabsBar .tab-btn").forEach(t => t.classList.remove("active"));
        e.currentTarget.classList.add("active");
        this.activeTab = e.currentTarget.dataset.tab;
        this.renderCenterEditor();
      });
    });
  }

  renderSidebar() {
    const listEl = this.containerEl.querySelector("#sidebarItemList");
    const query = this.containerEl.querySelector("#librarySearch").value.toLowerCase();
    const type = this.store.activeCardType;

    let items = [];
    if (type === "piece") items = this.store.project.pieces;
    else if (type === "spell") items = this.store.project.spells;
    else if (type === "land") items = this.store.project.lands;

    const filtered = items.filter(item => (item.name || "").toLowerCase().includes(query));

    listEl.innerHTML = filtered.map(item => `
      <div class="sidebar-item ${item.id === this.store.activeCardId ? 'active' : ''}" data-id="${item.id}">
        <div class="item-main">
          <span class="item-icon">${type === 'piece' ? (item.isKingEquivalent ? '👑' : '🛡️') : (type === 'spell' ? '✨' : '🌍')}</span>
          <strong class="item-name">${escapeHTML(item.name || 'Unnamed')}</strong>
        </div>
        <div class="item-meta">
          ${type === 'piece' ? `${item.pointsCost ?? 0} PTS • HP ${item.maxHp ?? 1}` : ''}
          ${type === 'spell' ? `Mana ${item.manaCost ?? 0} • ${item.element}` : ''}
          ${type === 'land' ? `${item.tileCount ?? 4} Tiles • ${item.element}` : ''}
        </div>
        <div class="item-actions">
          <button class="btn-item-action btn-dup" data-id="${item.id}" title="Duplicate">📋</button>
          <button class="btn-item-action btn-del" data-id="${item.id}" title="Delete">🗑️</button>
        </div>
      </div>
    `).join("");

    listEl.querySelectorAll(".sidebar-item").forEach(el => {
      el.addEventListener("click", (e) => {
        if (e.target.closest(".btn-item-action")) return;
        this.store.selectCard(el.dataset.id, type);
        this.renderSidebar();
        this.renderCenterEditor();
        this.updatePreview();
      });
    });

    listEl.querySelectorAll(".btn-dup").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const id = e.currentTarget.dataset.id;
        if (type === "piece") this.store.duplicatePiece(id);
        this.renderSidebar();
        this.renderCenterEditor();
        this.updatePreview();
      });
    });

    listEl.querySelectorAll(".btn-del").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const id = e.currentTarget.dataset.id;
        if (confirm("Delete this card?")) {
          if (type === "piece") this.store.deletePiece(id);
          this.renderSidebar();
          this.renderCenterEditor();
          this.updatePreview();
        }
      });
    });
  }

  renderCenterEditor() {
    const panel = this.containerEl.querySelector("#editorContentPanel");
    const type = this.store.activeCardType;

    if (type === "land") {
      this.landEditor = new LandEditor(panel, this.store, () => this.updatePreview());
      this.landEditor.render();
      return;
    }

    if (type === "spell") {
      this.spellEditor = new SpellEditor(panel, this.store, () => this.updatePreview());
      this.spellEditor.render();
      return;
    }

    const piece = this.store.getActivePiece();
    if (!piece) {
      panel.innerHTML = `<div class="empty-notice">No piece selected. Create or select a piece from the left sidebar.</div>`;
      return;
    }

    // Render Tab Content for Piece
    switch (this.activeTab) {
      case "basics":
        this.renderBasicsTab(panel, piece);
        break;
      case "stats":
        this.renderStatsTab(panel, piece);
        break;
      case "movement":
        this.renderMovementTab(panel, piece);
        break;
      case "activation":
        this.renderActivationTab(panel, piece);
        break;
      case "attacks":
        this.renderAttacksTab(panel, piece);
        break;
      case "abilities":
        this.renderAbilitiesTab(panel, piece);
        break;
      case "special":
        this.renderSpecialTab(panel, piece);
        break;
      case "notes":
        this.renderNotesTab(panel, piece);
        break;
    }
  }

  // 1. BASICS TAB
  renderBasicsTab(panel, piece) {
    panel.innerHTML = `
      <div class="designer-form-wrapper">
        <h3 class="form-section-title">📝 Basic Piece Information</h3>
        <div class="form-grid-2">
          <div class="form-group">
            <label>Piece Name:</label>
            <input type="text" id="pieceName" value="${escapeAttr(piece.name)}" />
          </div>
          <div class="form-group">
            <label>Subtitle / Class / Type:</label>
            <input type="text" id="pieceSubtitle" value="${escapeAttr(piece.subtitle)}" placeholder="e.g. Cavalry / Heavy" />
          </div>
          <div class="form-group">
            <label>Faction (Optional):</label>
            <input type="text" id="pieceFaction" value="${escapeAttr(piece.faction || '')}" placeholder="e.g. Order of Ember" />
          </div>
          <div class="form-group">
            <label>Points Cost:</label>
            <input type="number" id="piecePoints" value="${piece.pointsCost ?? 1}" min="0" />
          </div>
        </div>

        <div class="form-group checkbox-group-card">
          <label class="checkbox-label">
            <input type="checkbox" id="chkKingEq" ${piece.isKingEquivalent ? 'checked' : ''} />
            👑 <strong>King-Equivalent Piece</strong> (Required for legal army construction)
          </label>
        </div>

        <div class="form-group">
          <label>Description / Flavor Text:</label>
          <textarea id="pieceDesc" rows="3">${escapeHTML(piece.description || '')}</textarea>
        </div>

        <div class="form-group">
          <label>Tags / Keywords (Comma separated):</label>
          <input type="text" id="pieceTags" value="${escapeAttr((piece.tags || []).join(', '))}" placeholder="Infantry, Melee, Heavy" />
        </div>
      </div>
    `;

    const bind = (id, key, isNum = false, isBool = false) => {
      panel.querySelector(`#${id}`)?.addEventListener("input", (e) => {
        if (isBool) piece[key] = e.target.checked;
        else if (isNum) piece[key] = parseInt(e.target.value) || 0;
        else piece[key] = e.target.value;

        this.store.save();
        this.renderSidebar();
        this.updatePreview();
      });
    };

    bind("pieceName", "name");
    bind("pieceSubtitle", "subtitle");
    bind("pieceFaction", "faction");
    bind("piecePoints", "pointsCost", true);
    bind("chkKingEq", "isKingEquivalent", false, true);
    bind("pieceDesc", "description");

    panel.querySelector("#pieceTags")?.addEventListener("input", (e) => {
      piece.tags = e.target.value.split(",").map(s => s.trim()).filter(Boolean);
      this.store.save();
      this.updatePreview();
    });
  }

  // 2. STATS & HP TAB
  renderStatsTab(panel, piece) {
    panel.innerHTML = `
      <div class="designer-form-wrapper">
        <h3 class="form-section-title">❤️ Health & Core Piece Stats</h3>

        <div class="preset-hp-bar">
          <label>Quick Presets:</label>
          ${HEALTH_PRESETS.map(p => `
            <button class="btn-preset-hp" data-hp="${p.hp}" data-die="${p.die}" data-type="${p.type}">
              ${p.name} (${p.hp} HP / ${p.die})
            </button>
          `).join("")}
        </div>

        <div class="form-grid-2">
          <div class="form-group">
            <label>Maximum HP:</label>
            <input type="number" id="pieceMaxHp" value="${piece.maxHp ?? 1}" min="1" />
          </div>
          <div class="form-group">
            <label>Suggested Health Die:</label>
            <select id="pieceHealthDie">
              ${["d4", "d6", "d8", "d12", "d20", "Binary (2/1/0)", "Custom"].map(d => `
                <option value="${d}" ${piece.healthDie === d ? 'selected' : ''}>${d}</option>
              `).join("")}
            </select>
          </div>
          <div class="form-group">
            <label>Health Tracking Type:</label>
            <select id="pieceTrackType">
              ${["Mounted Die", "Binary / Physical State", "Custom"].map(t => `
                <option value="${t}" ${piece.healthTrackingType === t ? 'selected' : ''}>${t}</option>
              `).join("")}
            </select>
          </div>
          <div class="form-group">
            <label>Defense Value:</label>
            <input type="number" id="pieceDef" value="${piece.defense ?? 0}" min="0" />
          </div>
          <div class="form-group">
            <label>Movement Spec (Fixed or Rule Text):</label>
            <input type="text" id="pieceMovText" value="${escapeAttr(String(piece.movementText ?? '3'))}" />
          </div>
          <div class="form-group">
            <label>Maneuver Spec:</label>
            <input type="text" id="pieceManText" value="${escapeAttr(String(piece.maneuverText ?? '1'))}" />
          </div>
        </div>

        <h4 class="form-subsection-title">Traversal Properties</h4>
        <div class="traversal-checks">
          <label class="checkbox-inline">
            <input type="checkbox" id="chkPassFriendly" ${piece.movementProperties?.passFriendly ? 'checked' : ''} />
            Can move through friendly pieces
          </label>
          <label class="checkbox-inline">
            <input type="checkbox" id="chkPassEnemy" ${piece.movementProperties?.passEnemy ? 'checked' : ''} />
            Can move through enemy pieces
          </label>
          <label class="checkbox-inline">
            <input type="checkbox" id="chkJump" ${piece.movementProperties?.jump ? 'checked' : ''} />
            Jump / Ignores intervening pieces
          </label>
        </div>
      </div>
    `;

    panel.querySelectorAll(".btn-preset-hp").forEach(btn => {
      btn.addEventListener("click", (e) => {
        piece.maxHp = parseInt(e.currentTarget.dataset.hp);
        piece.healthDie = e.currentTarget.dataset.die;
        piece.healthTrackingType = e.currentTarget.dataset.type;
        this.store.save();
        this.renderStatsTab(panel, piece);
        this.updatePreview();
      });
    });

    const bind = (id, key, isNum = false) => {
      panel.querySelector(`#${id}`)?.addEventListener("input", (e) => {
        piece[key] = isNum ? parseInt(e.target.value) || 0 : e.target.value;
        this.store.save();
        this.updatePreview();
      });
    };

    bind("pieceMaxHp", "maxHp", true);
    bind("pieceHealthDie", "healthDie");
    bind("pieceTrackType", "healthTrackingType");
    bind("pieceDef", "defense", true);
    bind("pieceMovText", "movementText");
    bind("pieceManText", "maneuverText");

    const updateTrav = () => {
      piece.movementProperties = {
        passFriendly: panel.querySelector("#chkPassFriendly").checked,
        passEnemy: panel.querySelector("#chkPassEnemy").checked,
        jump: panel.querySelector("#chkJump").checked
      };
      this.store.save();
      this.updatePreview();
    };

    panel.querySelector("#chkPassFriendly")?.addEventListener("change", updateTrav);
    panel.querySelector("#chkPassEnemy")?.addEventListener("change", updateTrav);
    panel.querySelector("#chkJump")?.addEventListener("change", updateTrav);
  }

  // 3. MOVEMENT GRID TAB
  renderMovementTab(panel, piece) {
    panel.innerHTML = `
      <div class="designer-form-wrapper">
        <h3 class="form-section-title">🧭 Visual Movement Pattern Grid</h3>
        <p class="section-help-text">Click grid cells to define movement positions relative to piece facing <strong>NORTH (UP)</strong>.</p>
        <div id="movementGridContainer"></div>
      </div>
    `;

    const container = panel.querySelector("#movementGridContainer");
    this.movementGridEditor = new GridEditor(container, {
      mode: "movement",
      gridMap: piece.movementGrid || {},
      onChange: (newMap) => {
        piece.movementGrid = newMap;
        this.store.save();
        this.updatePreview();
      }
    });
  }

  // 4. ACTIVATION TAB
  renderActivationTab(panel, piece) {
    panel.innerHTML = `
      <div class="designer-form-wrapper">
        <h3 class="form-section-title">⚡ Activation Sequence & Maneuver Rules</h3>
        <div class="form-grid-2">
          <div class="form-group">
            <label>Default Maneuvers Count:</label>
            <input type="number" id="manCount" value="${piece.maneuverCount ?? 1}" min="0" />
          </div>
          <div class="form-group">
            <label>Maneuver Timing Window:</label>
            <select id="manTiming">
              ${["Anywhere during activation", "Before Movement", "After Movement", "Before Attack", "After Attack", "Custom"].map(t => `
                <option value="${t}" ${piece.maneuverTiming === t ? 'selected' : ''}>${t}</option>
              `).join("")}
            </select>
          </div>
        </div>

        <div class="form-group">
          <label>Custom Maneuver Override Text:</label>
          <input type="text" id="manCustom" value="${escapeAttr(piece.customManeuverText || '')}" placeholder="e.g. Can rotate 180° for 1 Maneuver" />
        </div>

        <h4 class="form-subsection-title">Activation Sequence Steps</h4>
        <div id="activationBuilderContainer"></div>
      </div>
    `;

    panel.querySelector("#manCount").addEventListener("input", (e) => {
      piece.maneuverCount = parseInt(e.target.value) || 0;
      this.store.save();
      this.updatePreview();
    });

    panel.querySelector("#manTiming").addEventListener("change", (e) => {
      piece.maneuverTiming = e.target.value;
      this.store.save();
      this.updatePreview();
    });

    panel.querySelector("#manCustom").addEventListener("input", (e) => {
      piece.customManeuverText = e.target.value;
      this.store.save();
      this.updatePreview();
    });

    const builderMount = panel.querySelector("#activationBuilderContainer");
    this.actBuilder = new ActivationBuilder(builderMount, piece.activationSequence, (seq) => {
      piece.activationSequence = seq;
      this.store.save();
      this.updatePreview();
    });
  }

  // 5. ATTACKS TAB
  renderAttacksTab(panel, piece) {
    piece.attacks = piece.attacks || [];
    this.activeAtkIdx = this.activeAtkIdx || 0;
    if (this.activeAtkIdx >= piece.attacks.length) this.activeAtkIdx = 0;

    const atk = piece.attacks[this.activeAtkIdx];

    panel.innerHTML = `
      <div class="designer-form-wrapper">
        <div class="attacks-manager-header">
          <h3 class="form-section-title">⚔️ Attack Profiles (${piece.attacks.length})</h3>
          <button class="btn-add-atk" id="btnAddAttack">➕ Add Attack Profile</button>
        </div>

        ${piece.attacks.length === 0 ? '<div class="empty-notice">No attacks defined. Click button to add an attack.</div>' : `
          <div class="attack-tabs-bar">
            ${piece.attacks.map((a, idx) => `
              <button class="atk-tab-btn ${idx === this.activeAtkIdx ? 'active' : ''}" data-idx="${idx}">
                ⚔️ ${escapeHTML(a.name || 'Attack ' + (idx + 1))}
              </button>
            `).join("")}
          </div>

          ${atk ? `
            <div class="active-attack-form">
              <div class="atk-toolbar-top">
                <strong>Editing Attack #${this.activeAtkIdx + 1}</strong>
                <button class="btn-del-atk" id="btnDeleteAttack">🗑️ Delete Attack</button>
              </div>

              <div class="form-grid-2">
                <div class="form-group">
                  <label>Attack Name:</label>
                  <input type="text" id="atkName" value="${escapeAttr(atk.name)}" />
                </div>
                <div class="form-group">
                  <label>Attack Value / Formula:</label>
                  <input type="text" id="atkValue" value="${escapeAttr(String(atk.attackValue ?? '3'))}" placeholder="Fixed (e.g. 4) or formula" />
                </div>
                <div class="form-group">
                  <label>Mana Cost:</label>
                  <input type="number" id="atkManaCost" value="${atk.manaCost ?? 0}" min="0" />
                </div>
                <div class="form-group">
                  <label>Mana Element:</label>
                  <select id="atkManaType">
                    ${["Neutral", "Fire", "Earth", "Water", "Air"].map(el => `<option value="${el}" ${atk.manaType === el ? 'selected' : ''}>${el}</option>`).join("")}
                  </select>
                </div>
                <div class="form-group">
                  <label>Min Range:</label>
                  <input type="number" id="atkRngMin" value="${atk.rangeMin ?? 1}" min="0" />
                </div>
                <div class="form-group">
                  <label>Max Range:</label>
                  <input type="number" id="atkRngMax" value="${atk.rangeMax ?? 1}" min="1" />
                </div>
              </div>

              <div class="form-grid-2">
                <div class="form-group checkbox-group-card">
                  <label class="checkbox-label">
                    <input type="checkbox" id="chkAdvCapture" ${atk.canAdvanceOnCapture ? 'checked' : ''} />
                    Advance into captured target's square
                  </label>
                </div>
                <div class="form-group">
                  <label>Knockback Tiles:</label>
                  <input type="number" id="atkKnockback" value="${atk.knockback ?? 0}" min="0" />
                </div>
              </div>

              <div class="form-group">
                <label>Status Effect Inflicted:</label>
                <select id="atkStatus">
                  <option value="">None</option>
                  ${this.store.project.statusEffects.map(st => `
                    <option value="${st.name}" ${atk.statusInflicted === st.name ? 'selected' : ''}>${st.name} - ${st.description}</option>
                  `).join("")}
                </select>
              </div>

              <div class="form-group">
                <label>Attack Rules Text / Effects:</label>
                <textarea id="atkRules" rows="2">${escapeHTML(atk.rulesText || '')}</textarea>
              </div>

              <h4 class="form-subsection-title">Visual Attack Pattern Grid (Facing North/UP)</h4>
              <div id="attackGridContainer"></div>
            </div>
          ` : ''}
        `}
      </div>
    `;

    panel.querySelector("#btnAddAttack")?.addEventListener("click", () => {
      piece.attacks.push({
        id: "atk_" + Math.random().toString(36).substr(2, 5),
        name: "New Attack",
        attackValue: "3",
        manaCost: 0,
        manaType: "Neutral",
        rangeMin: 1,
        rangeMax: 1,
        patternGrid: { "4,5": "target" },
        canAdvanceOnCapture: true,
        knockback: 0,
        statusInflicted: "",
        rulesText: ""
      });
      this.activeAtkIdx = piece.attacks.length - 1;
      this.store.save();
      this.renderAttacksTab(panel, piece);
      this.updatePreview();
    });

    panel.querySelectorAll(".attack-tabs-bar .atk-tab-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        this.activeAtkIdx = parseInt(e.currentTarget.dataset.idx);
        this.renderAttacksTab(panel, piece);
      });
    });

    if (atk) {
      panel.querySelector("#btnDeleteAttack")?.addEventListener("click", () => {
        piece.attacks.splice(this.activeAtkIdx, 1);
        this.activeAtkIdx = 0;
        this.store.save();
        this.renderAttacksTab(panel, piece);
        this.updatePreview();
      });

      const bindAtk = (id, key, isNum = false, isBool = false) => {
        panel.querySelector(`#${id}`)?.addEventListener("input", (e) => {
          if (isBool) atk[key] = e.target.checked;
          else if (isNum) atk[key] = parseInt(e.target.value) || 0;
          else atk[key] = e.target.value;

          this.store.save();
          this.updatePreview();
        });
      };

      bindAtk("atkName", "name");
      bindAtk("atkValue", "attackValue");
      bindAtk("atkManaCost", "manaCost", true);
      bindAtk("atkManaType", "manaType");
      bindAtk("atkRngMin", "rangeMin", true);
      bindAtk("atkRngMax", "rangeMax", true);
      bindAtk("chkAdvCapture", "canAdvanceOnCapture", false, true);
      bindAtk("atkKnockback", "knockback", true);
      bindAtk("atkStatus", "statusInflicted");
      bindAtk("atkRules", "rulesText");

      const atkGridMount = panel.querySelector("#attackGridContainer");
      this.attackGridEditor = new GridEditor(atkGridMount, {
        mode: "attack",
        gridMap: atk.patternGrid || {},
        onChange: (newMap) => {
          atk.patternGrid = newMap;
          this.store.save();
          this.updatePreview();
        }
      });
    }
  }

  // 6. ABILITIES & TERRAIN TAB
  renderAbilitiesTab(panel, piece) {
    piece.abilities = piece.abilities || [];
    piece.terrainAffinities = piece.terrainAffinities || [];

    panel.innerHTML = `
      <div class="designer-form-wrapper">
        <h3 class="form-section-title">🌟 Passive & Active Abilities</h3>
        <button class="btn-topbar" id="btnAddAbility">➕ Add Ability</button>
        <div class="abilities-list" id="abilitiesList"></div>

        <h4 class="form-subsection-title">🌍 Elemental Terrain Affinities</h4>
        <button class="btn-topbar" id="btnAddTerrain">➕ Add Terrain Affinity</button>
        <div class="terrain-list" id="terrainList"></div>
      </div>
    `;

    // Abilities render
    const abListEl = panel.querySelector("#abilitiesList");
    abListEl.innerHTML = piece.abilities.map((ab, idx) => `
      <div class="ability-edit-card" data-idx="${idx}">
        <div class="form-grid-2">
          <input type="text" class="input-ab-name" data-idx="${idx}" value="${escapeAttr(ab.name || '')}" placeholder="Ability Name" />
          <select class="sel-ab-type" data-idx="${idx}">
            ${["Passive", "Activated", "Reaction", "On Capture", "On Being Captured", "On Movement", "On Attack", "On Damage", "Terrain", "Aura", "Library", "Mana", "Custom"].map(t => `
              <option value="${t}" ${ab.type === t ? 'selected' : ''}>${t}</option>
            `).join("")}
          </select>
        </div>
        <textarea class="txt-ab-text" data-idx="${idx}" placeholder="Ability rules text...">${escapeHTML(ab.text || ab.effect || '')}</textarea>
        <button class="btn-seq-del btn-del-ab" data-idx="${idx}">Delete Ability</button>
      </div>
    `).join("");

    panel.querySelector("#btnAddAbility").addEventListener("click", () => {
      piece.abilities.push({ name: "New Ability", type: "Passive", text: "" });
      this.store.save();
      this.renderAbilitiesTab(panel, piece);
      this.updatePreview();
    });

    abListEl.querySelectorAll(".input-ab-name").forEach(inp => {
      inp.addEventListener("input", (e) => {
        piece.abilities[parseInt(e.target.dataset.idx)].name = e.target.value;
        this.store.save();
        this.updatePreview();
      });
    });

    abListEl.querySelectorAll(".sel-ab-type").forEach(sel => {
      sel.addEventListener("change", (e) => {
        piece.abilities[parseInt(e.target.dataset.idx)].type = e.target.value;
        this.store.save();
        this.updatePreview();
      });
    });

    abListEl.querySelectorAll(".txt-ab-text").forEach(txt => {
      txt.addEventListener("input", (e) => {
        piece.abilities[parseInt(e.target.dataset.idx)].text = e.target.value;
        this.store.save();
        this.updatePreview();
      });
    });

    abListEl.querySelectorAll(".btn-del-ab").forEach(btn => {
      btn.addEventListener("click", (e) => {
        piece.abilities.splice(parseInt(e.target.dataset.idx), 1);
        this.store.save();
        this.renderAbilitiesTab(panel, piece);
        this.updatePreview();
      });
    });

    // Terrain Affinities render
    const terListEl = panel.querySelector("#terrainList");
    terListEl.innerHTML = piece.terrainAffinities.map((t, idx) => `
      <div class="terrain-edit-card" data-idx="${idx}">
        <select class="sel-ter-element" data-idx="${idx}">
          ${["Fire", "Earth", "Water", "Air"].map(el => `<option value="${el}" ${t.terrain === el ? 'selected' : ''}>${el}</option>`).join("")}
        </select>
        <input type="text" class="input-ter-effect" data-idx="${idx}" value="${escapeAttr(t.effect || '')}" placeholder="Effect (e.g. +1 Defense)" />
        <button class="btn-seq-del btn-del-ter" data-idx="${idx}">✕</button>
      </div>
    `).join("");

    panel.querySelector("#btnAddTerrain").addEventListener("click", () => {
      piece.terrainAffinities.push({ terrain: "Earth", effect: "+1 Defense" });
      this.store.save();
      this.renderAbilitiesTab(panel, piece);
      this.updatePreview();
    });

    terListEl.querySelectorAll(".sel-ter-element").forEach(sel => {
      sel.addEventListener("change", (e) => {
        piece.terrainAffinities[parseInt(e.target.dataset.idx)].terrain = e.target.value;
        this.store.save();
        this.updatePreview();
      });
    });

    terListEl.querySelectorAll(".input-ter-effect").forEach(inp => {
      inp.addEventListener("input", (e) => {
        piece.terrainAffinities[parseInt(e.target.dataset.idx)].effect = e.target.value;
        this.store.save();
        this.updatePreview();
      });
    });

    terListEl.querySelectorAll(".btn-del-ter").forEach(btn => {
      btn.addEventListener("click", (e) => {
        piece.terrainAffinities.splice(parseInt(e.target.dataset.idx), 1);
        this.store.save();
        this.renderAbilitiesTab(panel, piece);
        this.updatePreview();
      });
    });
  }

  // 7. LIBRARY & MANA TAB
  renderSpecialTab(panel, piece) {
    panel.innerHTML = `
      <div class="designer-form-wrapper">
        <h3 class="form-section-title">📚 Libraries & Mana Storage</h3>

        <div class="form-group checkbox-group-card">
          <label class="checkbox-label">
            <input type="checkbox" id="chkHasLib" ${piece.hasLibrary ? 'checked' : ''} />
            📚 <strong>Carries a Library</strong> (Stores Spell Cards)
          </label>
        </div>

        <div class="form-grid-2">
          <div class="form-group">
            <label>Library Capacity (Spell Cards):</label>
            <input type="number" id="libCap" value="${piece.libraryCapacity ?? 0}" min="0" />
          </div>
          <div class="form-group">
            <label>Library Special Notes:</label>
            <input type="text" id="libNotes" value="${escapeAttr(piece.libraryNotes || '')}" placeholder="e.g. Hidden from opponent" />
          </div>
        </div>

        <hr class="form-divider" />

        <div class="form-group checkbox-group-card">
          <label class="checkbox-label">
            <input type="checkbox" id="chkCanStoreMana" ${piece.canStoreMana ? 'checked' : ''} />
            🔮 <strong>Can Store Mana</strong> (Persists mana between rounds)
          </label>
        </div>

        <div class="form-grid-2">
          <div class="form-group">
            <label>Mana Capacity:</label>
            <input type="number" id="manaCap" value="${piece.manaCapacity ?? 0}" min="0" />
          </div>
          <div class="form-group">
            <label>Mana Storage Notes:</label>
            <input type="text" id="manaNotes" value="${escapeAttr(piece.manaStorageNotes || '')}" placeholder="e.g. Loses all stored mana on capture" />
          </div>
        </div>
      </div>
    `;

    const bind = (id, key, isNum = false, isBool = false) => {
      panel.querySelector(`#${id}`)?.addEventListener("input", (e) => {
        if (isBool) piece[key] = e.target.checked;
        else if (isNum) piece[key] = parseInt(e.target.value) || 0;
        else piece[key] = e.target.value;

        this.store.save();
        this.updatePreview();
      });
    };

    bind("chkHasLib", "hasLibrary", false, true);
    bind("libCap", "libraryCapacity", true);
    bind("libNotes", "libraryNotes");

    bind("chkCanStoreMana", "canStoreMana", false, true);
    bind("manaCap", "manaCapacity", true);
    bind("manaNotes", "manaStorageNotes");
  }

  // 8. NOTES TAB
  renderNotesTab(panel, piece) {
    panel.innerHTML = `
      <div class="designer-form-wrapper">
        <h3 class="form-section-title">🧪 Prototype Notes & Versioning</h3>
        <p class="section-help-text">Notes entered here are saved in the project JSON but will <strong>NOT</strong> be displayed on the physical printed card.</p>
        
        <div class="form-group">
          <label>Internal Prototype / Design Notes:</label>
          <textarea id="protoNotes" rows="6" placeholder="Design intent, playtest results, balance ideas...">${escapeHTML(piece.prototypeNotes || '')}</textarea>
        </div>

        <div class="form-grid-2">
          <div class="form-group">
            <label>Card Unique Internal ID:</label>
            <input type="text" value="${escapeAttr(piece.id)}" disabled />
          </div>
          <div class="form-group">
            <label>Rules System Version:</label>
            <input type="text" value="${escapeAttr(this.store.project.rulesVersion)}" disabled />
          </div>
        </div>
      </div>
    `;

    panel.querySelector("#protoNotes")?.addEventListener("input", (e) => {
      piece.prototypeNotes = e.target.value;
      this.store.save();
    });
  }

  updatePreview() {
    if (this.store.activeCardType === "piece") {
      this.cardPreview.render(this.store.getActivePiece());
    } else {
      this.containerEl.querySelector("#previewCardMount").innerHTML = `<div class="card-preview-empty">Card preview currently optimized for Piece Cards.</div>`;
    }
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
