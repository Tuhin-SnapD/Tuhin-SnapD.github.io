# DevNotes - Your Public Knowledge Garden

A beautiful, modern knowledge garden built with Astro and Tailwind CSS. This is a personal space for technical notes, cheat sheets, and learning paths.

## 🌟 Features

- **Modern UI**: Clean, responsive design with dark mode support
- **Knowledge Organization**: Categorized notes and learning paths
- **Search Functionality**: Quick search through all your notes
- **Progress Tracking**: Monitor your learning journey
- **TIL Posts**: Share daily learnings and insights
- **Auto-deployment**: Automatically deploys to GitHub Pages

## 🚀 Tech Stack

- **Framework**: [Astro](https://astro.build/) - Static site generator
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- **Deployment**: GitHub Pages with GitHub Actions
- **Content**: Markdown files for easy note-taking

## 📁 Project Structure

```
src/
├── content/notes/     # Your markdown notes
├── layouts/          # Page layouts
├── pages/            # Astro pages
└── styles/           # Global styles
```

## 🛠️ Development

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start development server**:
   ```bash
   npm run dev
   ```

3. **Build for production**:
   ```bash
   npm run build
   ```

## 🚀 Deployment

This site automatically deploys to GitHub Pages when you push to the `main` branch. The deployment is handled by GitHub Actions.

### Manual Deployment

If you need to deploy manually:

```bash
npm run deploy
```

## 📝 Adding Content

1. **Add new notes**: Create markdown files in `src/content/notes/`
2. **Update pages**: Modify the corresponding `.astro` files in `src/pages/`
3. **Customize styling**: Edit `src/styles/global.css`

## 🎨 Customization

- **Colors**: Modify the color scheme in `tailwind.config.mjs`
- **Layout**: Update `src/layouts/Layout.astro`
- **Styling**: Edit `src/styles/global.css`

## 📄 License

MIT License - feel free to use this template for your own knowledge garden!

---

Built with ❤️ by [Tuhin SnapD](https://github.com/Tuhin-SnapD)
