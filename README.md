# 3D Car Driving Game - Tuhin SnapD

An interactive 3D car driving experience built with Three.js, featuring realistic car physics, smooth controls, and immersive 3D graphics.

## 🚀 Features

- **3D Car Model**: Detailed car with realistic proportions, including body, wheels, lights, and mirrors
- **Physics-Based Movement**: Realistic acceleration, deceleration, and turning mechanics
- **Smooth Camera Follow**: Dynamic third-person camera that follows the car
- **Interactive Controls**: WASD keys for movement, spacebar for braking
- **Real-time UI**: Live position, rotation, and speedometer display
- **Responsive Design**: Works on both desktop and mobile devices
- **Performance Optimized**: Smooth 60fps gameplay with optimized rendering

## 🎮 Game Controls

- **W** - Accelerate forward
- **S** - Reverse/brake
- **A** - Turn left
- **D** - Turn right
- **SPACE** - Emergency brake

## 🎨 Visual Features

### Car Details
- **Realistic Body**: Red car with detailed proportions
- **Animated Wheels**: Wheels rotate based on speed
- **Lighting System**: Headlights and taillights with emissive materials
- **Windows**: Transparent windows with realistic reflections
- **Mirrors**: Side mirrors for added detail
- **Exhaust Pipes**: Dual exhaust system

### Environment
- **3D Ground**: Large green plane as the driving surface
- **Circular Road**: Dark road surface for better contrast
- **Dynamic Lighting**: Ambient and directional lighting with shadows
- **Sky Background**: Light blue sky for immersive atmosphere

## 🛠️ Setup & Installation

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Tuhin-SnapD/Tuhin-SnapD.github.io.git
   cd Tuhin-SnapD.github.io
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

### Build for Production

```bash
npm run build
```

### Deploy to GitHub Pages

```bash
npm run deploy
```

## 📁 Project Structure

```
Tuhin-SnapD.github.io/
├── index.html           # Main HTML file with 3D game
├── package.json         # Dependencies and scripts
├── vite.config.js       # Vite configuration
├── deploy.js           # Deployment script
└── README.md           # This file
```

## 🔧 Technical Details

### Technologies Used
- **Three.js**: 3D graphics and rendering
- **Vanilla JavaScript**: Game logic and controls
- **Vite**: Build tool and development server
- **HTML5**: Game container and UI

### Key Features
- **WebGL Rendering**: Hardware-accelerated 3D graphics
- **Shadow Mapping**: Realistic shadows for all objects
- **Physics Simulation**: Custom physics for car movement
- **Responsive Design**: Adapts to different screen sizes
- **Performance Optimization**: Efficient rendering and updates

### Browser Support
- Chrome/Edge (recommended)
- Firefox
- Safari
- Mobile browsers (with touch controls)

## 🚀 Deployment

### GitHub Pages
The project is configured for GitHub Pages deployment:

1. Push your changes to the main branch
2. Run `npm run deploy`
3. Your game will be available at `https://tuhin-snapd.github.io`

### Other Hosting
For other hosting providers:
1. Run `npm run build`
2. Upload the `dist` folder contents to your hosting service

## 🎯 Future Enhancements

- **Multiple Car Models**: Different car types and colors
- **Track System**: Multiple tracks and obstacles
- **Multiplayer**: Multiplayer racing capabilities
- **Sound Effects**: Engine sounds and ambient audio
- **Mobile Controls**: Touch-based controls for mobile devices
- **Particle Effects**: Tire smoke and environmental effects

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- Three.js community for the amazing 3D library
- Vite team for the fast build tool
- The open-source community for inspiration and tools

---

**Built with ❤️ by Tuhin SnapD** 