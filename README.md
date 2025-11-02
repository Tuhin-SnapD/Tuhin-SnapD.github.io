# Interactive Portfolio Game

An interactive portfolio experience built with Phaser.js. Navigate through different zones representing your life journey, skills, projects, and achievements.

## 🎮 Features

- **Interactive World Map**: Explore zones representing different life stages
- **Player Movement**: Smooth character movement with idle and walk animations
- **Zone Interactions**: Enter zones to learn about different periods and achievements
- **Modal Dialogs**: Beautiful pixel-style modals with information and links
- **Mobile Support**: Touch controls for mobile devices
- **LocalStorage**: Tracks visited zones
- **Background Music**: Optional chill background music with toggle
- **Resume Download**: Quick access to resume from UI

## 🛠 Tech Stack

- **Phaser.js 3.70**: Game framework
- **Vite**: Build tool and dev server
- **Vanilla JavaScript**: ES Modules, no React
- **Tiled Map Editor**: (Optional) For creating custom maps

## 📁 Project Structure

```
portfolio-game/
├── public/
│   ├── index.html          # Main HTML file
│   └── data/
│       ├── mapData.json    # World map configuration
│       └── locations.json  # Zone content data
├── src/
│   ├── main.js            # Game entry point
│   └── scenes/
│       ├── preload.js     # Asset loading scene
│       ├── worldScene.js  # Main game world scene
│       └── uiScene.js     # Modal/dialog UI scene
├── package.json
├── vite.config.js
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js 16+ and npm

### Installation

1. Clone or download this repository
2. Install dependencies:

```bash
npm install
```

### Development

Start the development server:

```bash
npm run dev
```

The game will open in your browser at `http://localhost:3000`

### Build for Production

```bash
npm run build
```

This creates a `dist/` folder with optimized production files.

## 📦 Deployment to GitHub Pages

### Method 1: Automatic Deployment via GitHub Actions (Recommended)

1. Push your code to a GitHub repository
2. Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run build
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

3. Go to your repository Settings → Pages → Source: select "GitHub Actions"
4. Push to main branch - deployment will happen automatically

### Method 2: Manual Deployment

1. Build the project:
```bash
npm run build
```

2. In your repository settings, enable GitHub Pages (Settings → Pages)

3. Set source to deploy from `gh-pages` branch or `main` branch `/docs` folder

4. Copy the contents of `dist/` to your GitHub Pages directory:
   - If using `gh-pages` branch: push `dist/` contents to that branch
   - If using `/docs`: copy `dist/` contents to a `docs/` folder in your repo

### Important: Update Base Path

If your repository name is not exactly `Tuhin-SnapD.github.io`, update the base path in `vite.config.js`:

```js
export default defineConfig({
  base: '/your-repo-name/',  // Change this to your repo name
  // ... rest of config
});
```

## 🎨 Customization

### Editing Zone Content

Edit `public/data/locations.json` to update zone descriptions, links, and skills:

```json
{
  "current": {
    "title": "Current Stage",
    "description": "Your current role and focus...",
    "year": "2020-Present",
    "links": [
      {
        "text": "GitHub",
        "url": "https://github.com/yourusername",
        "icon": "github"
      }
    ]
  }
}
```

### Customizing the Map

Edit `public/data/mapData.json` to change zone positions and sizes:

```json
{
  "width": 40,
  "height": 30,
  "zones": [
    {
      "id": "childhood",
      "x": 5,
      "y": 5,
      "width": 5,
      "height": 5
    }
  ]
}
```

### Adding Custom Sprites

Replace placeholder sprites by:
1. Create your sprite images (PNG format, pixel art recommended)
2. Place them in `public/assets/player/`
3. Update `src/scenes/preload.js` to load your sprites instead of generating them

### Using Tiled Map Editor

1. Install [Tiled Map Editor](https://www.mapeditor.org/)
2. Create your map and export as JSON
3. Place exported JSON in `public/assets/maps/`
4. Update `preload.js` to load the Tiled map:

```js
this.load.tilemapTiledJSON('map', 'assets/maps/your-map.json');
```

## 🎮 Controls

- **Arrow Keys / WASD**: Move player
- **E Key**: Interact with zones
- **ESC**: Close modal dialogs
- **Mobile**: Touch controls appear automatically on touch devices

## 📝 Notes

- The game uses localStorage to remember visited zones
- Music preference is saved in localStorage
- All links open in new tabs
- The game is responsive and works on mobile and desktop

## 🔧 Troubleshooting

**Game doesn't load:**
- Check browser console for errors
- Ensure all JSON files are valid
- Verify base path in `vite.config.js` matches your repo name

**Assets not loading:**
- Make sure files are in `public/` folder (not `src/`)
- Check file paths in preload scene
- Clear browser cache

**Build fails:**
- Delete `node_modules` and `package-lock.json`
- Run `npm install` again
- Check Node.js version (requires 16+)

## 📄 License

Free to use and modify for your portfolio.

## 🙏 Credits

Built with [Phaser.js](https://phaser.io/) game framework.

---

**Enjoy building your interactive portfolio!** 🎉

