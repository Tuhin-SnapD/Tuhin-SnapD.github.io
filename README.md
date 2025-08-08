# 3D Car Driving Game

A 3D car driving experience built with Three.js and Vite.

## Features

- Realistic 3D car model with detailed components
- WASD controls for driving
- Real-time speedometer and position tracking
- Smooth camera following
- Responsive design

## Quick Start

### Option 1: Development with Vite (Recommended)

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:3000`

### Option 2: Direct HTML (CDN)

If you want to run the HTML file directly without Vite:

1. Open `index.html` in your browser
2. The game uses Three.js from CDN and should work immediately

## Controls

- **W** - Forward
- **S** - Backward  
- **A** - Turn Left
- **D** - Turn Right
- **SPACE** - Brake

## Build for Production

```bash
npm run build
```

## Deploy to GitHub Pages

```bash
npm run deploy
```

## Troubleshooting

### Module Resolution Issues

If you see errors like "Failed to resolve module specifier 'three'", make sure you're:

1. Using the development server (`npm run dev`) instead of opening the HTML file directly
2. Or using the CDN version in `index.html` for direct file access

### Performance Issues

- The game is optimized for modern browsers with WebGL support
- Lower-end devices may experience reduced performance

## Technologies Used

- Three.js - 3D graphics library
- Vite - Build tool and development server
- Vanilla JavaScript - Game logic and controls 