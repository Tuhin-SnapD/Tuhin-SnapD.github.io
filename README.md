# 3D Portfolio - Tuhin SnapD

An interactive 3D personal portfolio built with Babylon.js, featuring character controls, interactive zones, and mobile-friendly touch controls.

## 🚀 Features

- **3D Interactive Environment**: Low-poly 3D world built with Babylon.js
- **Dual Control Systems**: 
  - Desktop: WASD movement + mouse look
  - Mobile: Touch joystick controls
- **Interactive Zones**: Three themed areas (About Me, Projects, Resume)
- **Responsive Design**: Optimized for both desktop and mobile devices
- **Performance Optimized**: Low-poly models and efficient rendering
- **GitHub Pages Ready**: Configured for easy deployment

## 🎮 Controls

### Desktop
- **W/A/S/D**: Move character
- **Mouse**: Look around
- **Walk to colored platforms**: Trigger information popups

### Mobile
- **Touch Joystick**: Move character (bottom-left corner)
- **Walk to colored platforms**: Trigger information popups

## 🏗️ Interactive Zones

1. **About Me Zone** (Blue Platform)
   - Personal introduction and background
   - Skills and interests

2. **Projects Zone** (Orange Platform)
   - Showcase of key projects
   - Technologies used

3. **Resume Zone** (Purple Platform)
   - Work experience
   - Skills and qualifications

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
├── src/
│   └── main.js          # Main Babylon.js application
├── index.html           # Main HTML file with UI overlays
├── package.json         # Dependencies and scripts
├── vite.config.js       # Vite configuration
└── README.md           # This file
```

## 🎨 Customization

### Personal Information
Edit the popup content in `index.html`:
- About Me section (lines 108-113)
- Projects section (lines 115-120)
- Resume section (lines 122-132)

### 3D Environment
Modify the 3D scene in `src/main.js`:
- Zone positions in `createZonePlatforms()`
- Character appearance in `createCharacter()`
- Environment decorations in `createDecorations()`

### Styling
Customize the appearance in the `<style>` section of `index.html`:
- Colors and themes
- UI element positioning
- Mobile responsiveness

## 🔧 Technical Details

### Technologies Used
- **Babylon.js 6.0**: 3D graphics engine
- **Vite**: Build tool and development server
- **Vanilla JavaScript**: No framework dependencies
- **CSS3**: Styling and animations

### Performance Optimizations
- Low-poly models for better performance
- Efficient lighting setup
- Optimized render loop
- Mobile-specific camera controls

### Browser Support
- Chrome/Edge (recommended)
- Firefox
- Safari
- Mobile browsers (iOS Safari, Chrome Mobile)

## 🚀 Deployment

### GitHub Pages
The project is configured for GitHub Pages deployment:

1. Push your changes to the main branch
2. Run `npm run deploy`
3. Your site will be available at `https://tuhin-snapd.github.io`

### Other Hosting
For other hosting providers:
1. Run `npm run build`
2. Upload the `dist` folder contents to your hosting service

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- Babylon.js team for the amazing 3D engine
- Vite team for the fast build tool
- The open-source community for inspiration and tools

---

**Built with ❤️ by Tuhin SnapD** 