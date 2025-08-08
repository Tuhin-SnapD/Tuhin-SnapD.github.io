# 3D Car Driving Game - Tuhin SnapD

A 3D car driving experience built with Three.js featuring realistic car physics, WASD controls, and a beautiful 3D environment.

## 🚗 Features

- **Realistic 3D Car Model**: Detailed car with body, roof, wheels, headlights, taillights, windows, mirrors, and exhaust pipes
- **Smooth Physics**: Realistic acceleration, deceleration, and turning mechanics
- **Dynamic Camera**: Third-person camera that follows the car smoothly
- **Interactive Controls**: WASD for movement, SPACE for braking
- **Real-time UI**: Position, rotation, and speedometer display
- **Beautiful Environment**: Green ground with a circular road track
- **Responsive Design**: Works on different screen sizes

## 🎮 Controls

- **W** - Move forward
- **S** - Move backward  
- **A** - Turn left
- **D** - Turn right
- **SPACE** - Brake

## 🛠️ Setup & Installation

### Option 1: CDN Version (Recommended for quick start)

1. Simply open `index.html` in your browser
2. The game uses Three.js loaded from CDN (jsDelivr)

### Option 2: Local Development with Vite

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open `http://localhost:3000` in your browser

4. For the Vite version, use `index-vite.html` which imports Three.js from local node_modules

## 🔧 Build & Deploy

### Build for Production
```bash
npm run build
```

### Deploy to GitHub Pages
```bash
npm run deploy
```

## 🐛 Troubleshooting

### Three.js Build Error Fix

If you encounter the error:
```
Uncaught Error: [Package Error] "three@v0.179.1" could not be built.
```

**Solution**: The project has been updated to use Three.js version 0.158.0 which is more stable and compatible with CDN services.

**Changes made**:
- Updated `package.json` to use `"three": "^0.158.0"`
- Updated CDN import in `index.html` to use jsDelivr: `https://cdn.jsdelivr.net/npm/three@0.158.0/build/three.module.js`

### Alternative Solutions

1. **Use Local Three.js**: The `src/main.js` file imports Three.js from local node_modules, avoiding CDN issues
2. **Different CDN**: If one CDN fails, try others like:
   - jsDelivr: `https://cdn.jsdelivr.net/npm/three@0.158.0/build/three.module.js`
   - unpkg: `https://unpkg.com/three@0.158.0/build/three.module.js`
   - Skypack: `https://cdn.skypack.dev/three@0.158.0`

## 📁 Project Structure

```
Tuhin-SnapD.github.io/
├── index.html              # CDN version (standalone)
├── index-vite.html         # Vite version (uses local Three.js)
├── src/
│   └── main.js            # Three.js game logic
├── package.json           # Dependencies and scripts
├── vite.config.js         # Vite configuration
└── README.md              # This file
```

## 🎨 Technical Details

- **3D Engine**: Three.js for 3D graphics
- **Physics**: Custom physics system for realistic car movement
- **Materials**: Phong materials for realistic lighting and reflections
- **Shadows**: PCF soft shadow mapping for realistic shadows
- **Performance**: Optimized rendering with proper geometry and material usage

## 🌟 Future Enhancements

- [ ] Multiple car models
- [ ] Different tracks and environments
- [ ] Sound effects and music
- [ ] Mobile touch controls
- [ ] Multiplayer support
- [ ] Car customization options

## 📄 License

This project is open source and available under the MIT License.

---

**Created by Tuhin SnapD** 🚗✨ 