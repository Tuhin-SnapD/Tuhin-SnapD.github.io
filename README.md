# DevNotes - Your Public Knowledge Garden

A beautiful, modern knowledge garden built with Astro and Tailwind CSS. This is a personal space for technical notes, cheat sheets, and learning paths.

## 🌟 Features

- **Modern UI**: Clean, responsive design with dark mode support
- **Knowledge Organization**: Categorized notes and learning paths
- **Search Functionality**: Quick search through all your notes
- **Add Notes Feature**: Create and manage your own notes through the web interface
- **TIL Posts**: Share daily learnings and insights with quick-add functionality
- **Auto-deployment**: Automatically deploys to GitHub Pages
- **Content Collections**: Organized content management with Astro's content collections
- **RSS Feed**: Subscribe to updates via RSS
- **Sitemap**: SEO-friendly sitemap generation

## 🚀 Tech Stack

- **Framework**: [Astro](https://astro.build/) - Static site generator
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- **Content**: Markdown files with frontmatter for easy note-taking
- **Deployment**: GitHub Pages with automatic deployment
- **Typography**: Tailwind Typography plugin for beautiful content rendering

## 📁 Project Structure

```
src/
├── content/
│   ├── notes/          # Technical notes and guides
│   ├── til/           # Today I Learned posts
│   └── config.ts      # Content collection schemas
├── components/        # Reusable Astro components
├── layouts/          # Page layouts
├── pages/            # Astro pages and API routes
│   └── api/          # API endpoints for content management
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

4. **Preview production build**:
   ```bash
   npm run preview
   ```

## 🚀 Deployment

This site automatically deploys to GitHub Pages when you push to the `main` branch. The deployment is handled by GitHub Actions.

### Manual Deployment

If you need to deploy manually:

```bash
npm run deploy
```

## 📝 Adding Content

### Through the Web Interface

1. **Add new notes**: Visit `/notes/add` to create new technical notes
2. **Add TIL posts**: Visit `/til/add` for detailed TIL posts or use the quick-add form on `/til`
3. **Quick TIL**: Use the quick-add form for simple daily learnings

### Manually

1. **Add new notes**: Create markdown files in `src/content/notes/`
2. **Add TIL posts**: Create markdown files in `src/content/til/`
3. **Update pages**: Modify the corresponding `.astro` files in `src/pages/`

### Content Structure

Each content file should include frontmatter:

```markdown
---
title: "Your Title"
description: "Optional description"
tags: ["tag1", "tag2"]
date: "2024-01-01"
category: "category-name"
published: true
---

Your content here...
```

## 🎨 Customization

- **Colors**: Modify the color scheme in `tailwind.config.mjs`
- **Layout**: Update `src/layouts/Layout.astro`
- **Styling**: Edit `src/styles/global.css`
- **Content Schema**: Modify `src/content/config.ts` for content validation

## 📊 Content Statistics

- **Notes**: Technical guides and comprehensive documentation
- **TIL Posts**: Quick learnings and daily insights
- **Categories**: Organized by technology and topic
- **Tags**: Flexible tagging system for easy discovery

## 🔧 API Endpoints

- `/api/add-note` - Create new notes
- `/api/add-til` - Create detailed TIL posts
- `/api/quick-add-til` - Quick TIL creation

## 📄 License

MIT License - feel free to use this template for your own knowledge garden!

---

Built with ❤️ by [Tuhin SnapD](https://github.com/Tuhin-SnapD)
