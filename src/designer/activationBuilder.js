/**
 * Tile Kings Activation Sequence Builder
 * Visual builder for piece activation steps (Move, Maneuver, Attack, Cast, Ability, etc.)
 */

export const ACTION_BLOCK_TYPES = [
  { name: "Move", color: "#059669", icon: "👟" },
  { name: "Maneuver", color: "#0284c7", icon: "🔄" },
  { name: "Attack", color: "#dc2626", icon: "⚔️" },
  { name: "Draw", color: "#7c3aed", icon: "🎴" },
  { name: "Cast", color: "#d97706", icon: "✨" },
  { name: "Ability", color: "#2563eb", icon: "🌟" },
  { name: "Interact", color: "#0891b2", icon: "✋" },
  { name: "Custom", color: "#4b5563", icon: "📝" }
];

export class ActivationBuilder {
  constructor(containerEl, sequence = [], onChange = () => {}) {
    this.containerEl = containerEl;
    this.sequence = Array.isArray(sequence) ? sequence : [];
    this.onChange = onChange;
    
    this.initUI();
  }

  setSequence(seq) {
    this.sequence = Array.isArray(seq) ? seq : [];
    this.render();
  }

  initUI() {
    this.containerEl.innerHTML = `
      <div class="activation-builder-wrapper">
        <div class="activation-toolbar">
          <label>Add Step:</label>
          <div class="add-block-buttons" id="addBlockBtns"></div>
        </div>
        <div class="sequence-list" id="sequenceList"></div>
        <div class="sequence-summary-preview" id="sequenceSummaryPreview"></div>
      </div>
    `;

    this.addBtnsEl = this.containerEl.querySelector("#addBlockBtns");
    this.listEl = this.containerEl.querySelector("#sequenceList");
    this.summaryEl = this.containerEl.querySelector("#sequenceSummaryPreview");

    // Add buttons
    this.addBtnsEl.innerHTML = ACTION_BLOCK_TYPES.map(b => `
      <button class="btn-add-action" data-type="${b.name}" style="border-color: ${b.color};">
        <span>${b.icon}</span> + ${b.name}
      </button>
    `).join("");

    this.addBtnsEl.querySelectorAll(".btn-add-action").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const type = e.currentTarget.dataset.type;
        this.sequence.push({
          type,
          isOptional: type === "Attack",
          branchLabel: ""
        });
        this.render();
        this.onChange(this.sequence);
      });
    });

    this.render();
  }

  render() {
    if (this.sequence.length === 0) {
      this.listEl.innerHTML = `<div class="empty-seq-notice">No action steps added. Click buttons above to add Move, Attack, Maneuver, etc.</div>`;
    } else {
      this.listEl.innerHTML = this.sequence.map((item, idx) => {
        const info = ACTION_BLOCK_TYPES.find(b => b.name === item.type) || ACTION_BLOCK_TYPES[7];
        return `
          <div class="sequence-item-card" data-idx="${idx}" style="border-left: 4px solid ${info.color}">
            <div class="seq-item-handle">
              <span>${info.icon}</span>
              <strong>${item.type}</strong>
            </div>
            <div class="seq-item-controls">
              <label class="checkbox-inline">
                <input type="checkbox" class="chk-optional" data-idx="${idx}" ${item.isOptional ? 'checked' : ''} />
                Optional
              </label>
              <input type="text" class="input-branch" data-idx="${idx}" placeholder="Branch / Note (e.g. OR)" value="${item.branchLabel || ''}" />
              <button class="btn-seq-move" data-idx="${idx}" data-dir="-1" ${idx === 0 ? 'disabled' : ''}>▲</button>
              <button class="btn-seq-move" data-idx="${idx}" data-dir="1" ${idx === this.sequence.length - 1 ? 'disabled' : ''}>▼</button>
              <button class="btn-seq-del" data-idx="${idx}">✕</button>
            </div>
          </div>
        `;
      }).join("");
    }

    // Attach control listeners
    this.listEl.querySelectorAll(".chk-optional").forEach(chk => {
      chk.addEventListener("change", (e) => {
        const idx = parseInt(e.target.dataset.idx);
        this.sequence[idx].isOptional = e.target.checked;
        this.renderSummary();
        this.onChange(this.sequence);
      });
    });

    this.listEl.querySelectorAll(".input-branch").forEach(inp => {
      inp.addEventListener("input", (e) => {
        const idx = parseInt(e.target.dataset.idx);
        this.sequence[idx].branchLabel = e.target.value;
        this.renderSummary();
        this.onChange(this.sequence);
      });
    });

    this.listEl.querySelectorAll(".btn-seq-move").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const idx = parseInt(e.currentTarget.dataset.idx);
        const dir = parseInt(e.currentTarget.dataset.dir);
        const newIdx = idx + dir;
        if (newIdx >= 0 && newIdx < this.sequence.length) {
          const temp = this.sequence[idx];
          this.sequence[idx] = this.sequence[newIdx];
          this.sequence[newIdx] = temp;
          this.render();
          this.onChange(this.sequence);
        }
      });
    });

    this.listEl.querySelectorAll(".btn-seq-del").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const idx = parseInt(e.currentTarget.dataset.idx);
        this.sequence.splice(idx, 1);
        this.render();
        this.onChange(this.sequence);
      });
    });

    this.renderSummary();
  }

  renderSummary() {
    const summaryText = formatActivationSequence(this.sequence);
    this.summaryEl.innerHTML = `<strong>Card Output Preview:</strong> <code>${summaryText}</code>`;
  }
}

/**
 * Converts activation sequence array to a formatted string for printed cards
 */
export function formatActivationSequence(sequence = []) {
  if (!sequence || sequence.length === 0) return "Standard Activation";
  return sequence.map(item => {
    let str = item.type;
    if (item.isOptional) str += " (Optional)";
    if (item.branchLabel) str = `[${item.branchLabel}] ${str}`;
    return str;
  }).join(" ➔ ");
}
