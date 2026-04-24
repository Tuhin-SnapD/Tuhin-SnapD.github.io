# Interactive Portfolio — Life Journey Game

A Mario-inspired side-scrolling portfolio built with [Phaser 3](https://phaser.io/) and [Vite](https://vitejs.dev/). Run, jump, and collect coins while walking your visitor through a timeline of zones — childhood, school, college, first job, current role, skills, projects, and future goals — each revealing a modal with details and links.

Live site: https://tuhin-snapd.github.io/Tuhin-SnapD.github.io/

---

## Table of contents

- [Demo overview](#demo-overview)
- [Tech stack](#tech-stack)
- [Project structure](#project-structure)
- [Getting started](#getting-started)
- [Scripts](#scripts)
- [Controls](#controls)
- [How it works](#how-it-works)
- [Customization](#customization)
- [Persistence (localStorage)](#persistence-localstorage)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [License](#license)

---

## Demo overview

- **Side-scrolling 2D platformer** at 1280×720, scaled to fit the viewport (`Phaser.Scale.FIT`, centered).
- **Arcade physics** with gravity (`y: 800`), ground collision, jumping, and platform collisions.
- **Eight zones** laid out across a scrolling world. Entering a zone shows a "Press E" prompt; interacting opens an animated modal.
- **Programmatic pixel art** — all player frames, tiles, coins, clouds, mountains, and bushes are drawn with `Phaser.Graphics` and baked into textures at load time. No sprite sheets to manage.
- **Parallax backdrop** with sky, mountains, and floating clouds moving at different scroll speeds.
- **Collectible coins** scattered across the world; the count persists between visits.
- **Resume download** button inside the Projects modal (expects `/resume.pdf`).
- **Music toggle** and **mobile touch controls** (auto-shown on touch devices).

## Tech stack

| Dependency | Version | Role |
|---|---|---|
| [Phaser](https://phaser.io/) | `^3.70.0` | Game engine (arcade physics, input, scenes, tweens, particles) |
| [Vite](https://vitejs.dev/) | `^5.0.0` | Dev server, HMR, production bundler |
| Vanilla JS (ES modules) | — | No framework, no TypeScript |
| Node.js | `18+` | Required to run Vite (GitHub Actions builds on `18`) |

## Project structure

```
Tuhin-SnapD.github.io/
├── .github/
│   └── workflows/
│       └── deploy.yml            # GitHub Pages deployment (Node 18)
├── public/
│   └── data/
│       ├── mapData.json          # World size + zone positions (loaded at runtime)
│       └── locations.json        # Zone titles, descriptions, years, links, skills
├── src/
│   ├── main.js                   # Phaser config + game bootstrap
│   └── scenes/
│       ├── preload.js            # Loads JSON + generates all pixel-art textures
│       ├── worldScene.js         # World, player, zones, coins, backgrounds, HUD
│       └── uiScene.js            # Modal dialog shown when interacting with a zone
├── index.html                    # Single-page shell (game mounts into #game-container)
├── vite.config.js                # Dev server + GitHub Pages base path
├── package.json
└── README.md
```

## Getting started

### Prerequisites

- Node.js **18 or newer** (the deployment workflow uses Node 18)
- npm (bundled with Node)

### Install and run

```bash
npm install
npm run dev
```

The dev server starts on http://localhost:3000 and opens automatically. Vite HMR is enabled; saving a source file will hot-reload the scene.

### Build

```bash
npm run build      # writes production bundle to dist/
npm run preview    # serves the built output locally
```

## Scripts

| Script | What it does |
|---|---|
| `npm run dev` | Start Vite dev server on port 3000 with auto-open |
| `npm run dev:debug` | Same, but breaks on the first line so you can attach a Node inspector |
| `npm run build` | Bundle to `dist/` with Phaser split into its own chunk |
| `npm run preview` | Serve the built `dist/` folder locally |

## Controls

| Action | Keyboard | Touch (mobile) |
|---|---|---|
| Move left | `←` or `A` | Left arrow button (bottom-left) |
| Move right | `→` or `D` | Right arrow button |
| Jump | `Space` or `W` | Up arrow button |
| Interact with zone | `E` | `E` button (bottom-right) |
| Close modal | `ESC` or click overlay / `×` | Tap overlay or `×` |
| Toggle music | Click **♪** button (top-right) | Tap **♪** button |
| Download résumé | Click **📄** button (top-right) | Tap **📄** button |

## How it works

### Scenes

The game registers three Phaser scenes in `src/main.js`:

1. **`PreloadScene`** (`src/scenes/preload.js`)
   - Shows a progress bar while loading.
   - Fetches `data/mapData.json` and `data/locations.json` using `import.meta.env.BASE_URL` so paths work both locally (`/`) and on GitHub Pages (`/Tuhin-SnapD.github.io/`).
   - Generates all pixel-art textures on the fly via `Graphics.generateTexture()`: `player_idle`, `player_walk1`, `player_walk2`, `grass`, `dirt`, `brick`, `question_block`, `solid_block`, `coin`, `sky`, `cloud`, `big_cloud`, `mountain`, `bush`.
   - Starts `WorldScene` when done.

2. **`WorldScene`** (`src/scenes/worldScene.js`)
   - Builds the world: ground strip, floating platforms, mountains, clouds, bushes, and decorative question/brick/solid blocks.
   - Spawns the player at `(100, groundY - 50)` with arcade physics and idle/walk animations.
   - Creates eight zone volumes from `mapData.zones`, each with a pulsing highlight, glow rings, a "📍" marker, a label, and sparkle particles.
   - Scatters 10 coins across the level; collection is persisted by position key so collected coins stay gone between reloads.
   - Handles input, camera follow (horizontal), zone overlap detection, and interaction.
   - Draws a HUD that ignores scroll: coin counter, music toggle, and résumé button.

3. **`UIScene`** (`src/scenes/uiScene.js`)
   - Launched on top of `WorldScene` when the player presses `E` inside a zone.
   - Renders an animated dark modal (scale + fade-in, `Back.easeOut`) containing: title, year, description (auto word-wrapped), optional skills bullet list, action buttons for external links, and a "📄 Download Resume" button (shown only in the `projects` zone).
   - Centralizes all styling in a static `STYLES` object (colors, fonts, sizes, opacity, stroke widths).
   - Closes on `ESC`, clicking the overlay, or the red `×` button; resumes world input via `WorldScene.resumeMovement()`.

### Data flow

```
public/data/mapData.json ──┐
                           ├─► PreloadScene (Phaser loader)
public/data/locations.json ┘        │
                                    ▼
                             WorldScene builds zones
                                    │
                             Player enters zone
                                    │
                                    ▼ (launch)
                             UIScene renders modal
```

### Game config summary (`src/main.js`)

```js
{
  type: Phaser.AUTO,
  width: 1280, height: 720,
  backgroundColor: '#87ceeb',      // sky blue
  pixelArt: true,
  physics: { default: 'arcade', arcade: { gravity: { y: 800 } } },
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH,
           min: { width: 640, height: 360 },
           max: { width: 1920, height: 1080 } },
  scene: [PreloadScene, WorldScene, UIScene]
}
```

## Customization

### Editing zone content — `public/data/locations.json`

Every top-level key must match a `zones[].id` from `mapData.json`. Supported fields:

```jsonc
{
  "projects": {
    "title": "Projects",                 // required — modal header
    "description": "...",                // required — body text, auto-wrapped
    "year": "Various",                   // optional — small line under the title
    "skills": ["JavaScript", "React"],   // optional — rendered as a bullet list
    "links": [                           // optional — rendered as clickable buttons
      { "text": "GitHub", "url": "https://github.com/you", "icon": "github" }
    ]
  }
}
```

The `icon` field is currently unused (buttons render text only), but the key is preserved for future use. Links open in a new tab with `noopener,noreferrer`.

The **`projects`** zone is special: its modal also renders a "📄 Download Resume" button that opens `/resume.pdf` in a new tab. Drop your PDF at `public/resume.pdf` to wire it up.

### Editing the map — `public/data/mapData.json`

```jsonc
{
  "width": 40,                // logical tile-count width
  "height": 30,               // logical tile-count height
  "tileWidth": 32,
  "tileHeight": 32,
  "zones": [
    { "id": "childhood",  "x": 5,  "y": 5, "width": 5, "height": 5 },
    { "id": "school",     "x": 15, "y": 5, "width": 5, "height": 5 }
    // ...
  ]
}
```

`WorldScene` computes `worldWidth = max(width × tileWidth, furthestZoneX + 500)` and anchors every zone on the ground line (`groundY - 50`). Zone `x`/`width` are used as pixel values when placing the collision zone, visual rectangle, glow rings, label, and sparkle marker — so pick coordinates that space zones comfortably across the world width.

Zone IDs are camelCase; the label auto-formats them into "First Job", "Current", etc.

### Replacing the generated art

All textures live in `preload.js` as `Graphics.generateTexture(key, w, h)` calls. To swap in your own art:

1. Drop PNGs into `public/assets/` (any subfolder).
2. Replace the corresponding `create*Sprite`/`createPlaceholderTiles` block with `this.load.image('player_idle', 'assets/player_idle.png')` (plus walk frames).
3. The rest of the game (animations, tinting, scaling) works as-is because everything is keyed by texture name.

Keys you'll likely want to replace: `player_idle`, `player_walk1`, `player_walk2`, `grass`, `brick`, `question_block`, `solid_block`, `coin`, `cloud`, `big_cloud`, `mountain`, `bush`.

## Persistence (localStorage)

The game stores three keys under the site's origin:

| Key | Shape | Purpose |
|---|---|---|
| `visitedZones` | `string[]` of zone IDs | Triggers a celebratory particle burst the first time each zone is entered |
| `collectedCoins` | `string` (count) | Total coins collected; drives the HUD counter |
| `collectedCoinPositions` | `string[]` of `"x,y"` | Coins already picked up; skipped on respawn |
| `musicEnabled` | `"true"` / `"false"` | Music toggle state (default enabled) |

Clear these in DevTools → Application → Local Storage to reset progress.

## Deployment

### GitHub Pages (automated — already configured)

`.github/workflows/deploy.yml` runs on every push to `main`:

1. Checks out, sets up Node 18 with npm cache.
2. `npm install` → `npm run build`.
3. Uploads `dist/` and deploys via `actions/deploy-pages@v4`.

One-time setup in the GitHub repo: **Settings → Pages → Build and deployment → Source: GitHub Actions**.

### Base path

`vite.config.js` switches the base path depending on command:

```js
const base = command === 'serve' ? '/' : '/Tuhin-SnapD.github.io/';
```

If you fork this repo under a different name, update the production branch to `/<your-repo-name>/` so asset URLs resolve on GitHub Pages.

### Manual build

```bash
npm run build
# then serve dist/ from any static host (Netlify, Vercel, S3, etc.)
```

For non-GitHub-Pages hosts, set the production base to `/` in `vite.config.js`.

## Troubleshooting

**Blank page on GitHub Pages**
Check the browser console for 404s on `/data/*.json` — this almost always means the Vite `base` doesn't match the repo name. Confirm `vite.config.js` and re-deploy.

**HMR / WebSocket errors in dev**
`vite.config.js` intentionally uses `base: '/'` during `serve` to avoid HMR path issues. If you changed it, revert.

**Game loads but the player falls through the ground**
Make sure you didn't delete the `grass` texture generator in `preload.js` — the ground platform depends on it.

**Coins never disappear after reload**
`collectedCoinPositions` is keyed by `"x,y"`. If you edit coin spawn positions in `worldScene.js`, previously collected entries will orphan. Clear `collectedCoinPositions` in localStorage.

**"Failed to load mapData" in console**
The JSON fetch 404'd. In dev, confirm the file exists at `public/data/mapData.json`. In prod, confirm the base path matches the deployment subpath.

**Build fails with Phaser chunk errors**
Delete `node_modules` and `package-lock.json`, then reinstall. The build uses a manual chunk for Phaser (`rollupOptions.output.manualChunks.phaser`).

## License

No license file is included. The code is shared as a portfolio template; feel free to fork and adapt for your own personal portfolio.

## Credits

- Game engine: [Phaser 3](https://phaser.io/)
- Bundler: [Vite](https://vitejs.dev/)
- Visual style inspired by Super Mario Bros.
