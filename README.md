# 👑 Tile Kings - Tactical Board Game & Visual Card Designer

> A tactical 12x12 tabletop army skirmish game and standalone **Visual Card & Piece Designer application**.

---

## 🌟 Overview

**Tile Kings** is a 12×12 tactical skirmish game played with custom army compositions, facing directionality (North, East, South, West), deterministic damage calculations, elemental mana identities (Fire, Earth, Water, Air), and interactive multi-tile land terrain creation.

This repository contains both the **Playable Game Sandbox** and the **Visual Card & Piece Designer**.

---

## 🎮 Features

### 1. ⚔️ Playable Game Sandbox (`index.html`)
* **12×12 Skirmish Grid**: Full rank (1-12) and file (A-L) notation with dynamic piece tokens and non-overlapping facing arrows & HP badges.
* **Army Deployment**: Alternating deployment phase or instant **⚡ Lightning Mode** pre-deployed sandbox.
* **Multi-Tile Land Placement**: Select base tile and expand connected orthogonal elemental terrain (Fire, Earth, Water, Air) with real-time placement banner, undo, and cancel support.
* **Deterministic Combat System**: `Received Damage = Attack Value - Defense Value`.
* **Multi-Device & Local Multiplayer**: Cross-window and cross-device real-time state synchronization via BroadcastChannel and HTTP network API.

### 🎨 Visual Card & Piece Designer (`designer.html`)
* **Desktop 3-Column Visual Layout**: Left Sidebar Content Library, Center Form Editors, and Right Live Physical Board Game Card Preview.
* **Facing-Relative Grid Editors**: Interactive 11x11 North-centered visual grids for Movement patterns and Attack AOE patterns, with real-time SVG mini-diagram generation.
* **Activation Sequence Builder**: Draggable/reorderable action blocks (`Move`, `Maneuver`, `Attack`, `Cast`, `Ability`, `Draw`, `Interact`) with optional flags and branching ("OR").
* **Multiple Attack Profiles**: Formulas (e.g. `Tiles moved / 2 + 2`), Mana costs, Range, Capture advance, Knockback, and Status Effects (Stun, Haste, Quicken, Empower, Defended, Frenzy, Immobile).
* **Live Card Preview & High-Res Export**: Dynamic section hiding for maximum card legibility, **📷 Export High-Res PNG** canvas downloader, and **📄 Print Card** sheet styles.
* **🌐 Community Card Gallery**: Pre-loaded community pieces (*Ember Drake*, *Iron Paladin*, *Storm Weaver*, *Verdant Treant*, *Void Spectre*, *Royal Arbalest*) with **📥 Import into My Set** 1-click importing.

---

## 🚀 How to Run & Host

### Option A: Local Browser (Zero Setup)
Simply open `index.html` or `designer.html` directly in any web browser!

### Option B: Local Wi-Fi Web Server (Play with Friends at Home)
1. Double-click **`start-server.bat`** (or run `powershell -ExecutionPolicy Bypass -File server.ps1`).
2. Open on your PC: `http://localhost:8080/`
3. Share with friends on your local Wi-Fi network: `http://<your-local-ip>:8080/`

### Option C: 24/7 Free Web Hosting (GitHub Pages)
1. Upload this repository to your **GitHub** account.
2. In your repository settings, go to **Pages** ➔ select **`main`** branch ➔ click **Save**.
3. Your game will be live 24/7 at `https://<your-username>.github.io/tile-kings/`!

---

## 📁 Repository Structure

```text
├── index.html            # Playable Game Sandbox entry point
├── designer.html         # Visual Card & Piece Designer entry point
├── style.css             # Core design system & responsive styling
├── server.ps1            # Native PowerShell web server & multiplayer sync API
├── start-server.bat      # Double-clickable Windows server launcher
├── README.md             # Project documentation
├── TileKings-v0.5.zip    # Full zipped application release package
└── src/
    ├── app.js            # Tabletop game engine & state manager
    └── designer.js       # Standalone card & piece designer engine
```

---

## 📜 Version & License
* **Game Rules Version**: Tile Kings v0.1 Prototype
* **Card Version**: 1.0
* Open-source for tabletop game development and playtesting.
