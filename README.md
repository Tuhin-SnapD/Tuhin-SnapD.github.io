# 📚 DevNotes - Your Public Knowledge Garden

A beautiful, modern personal knowledge garden built with Astro.js and Tailwind CSS. Document your technical learnings, share cheat sheets, and track your learning progress in a beautifully organized website.

## ✨ Features

- **📝 Markdown Support** - Write notes in Markdown with syntax highlighting
- **🔍 Searchable Interface** - Find notes quickly with real-time search
- **🏷️ Tag-based Filtering** - Organize content with tags and categories
- **🌙 Dark Mode Toggle** - Comfortable reading in any lighting condition
- **📊 Progress Tracker** - Monitor your learning journey across topics
- **💡 TIL Section** - Share daily micro-learnings
- **📱 Responsive Design** - Works perfectly on all devices
- **⚡ Fast Performance** - Built with Astro.js for optimal speed

## 🛠️ Tech Stack

- **Framework**: [Astro.js](https://astro.build/) - Static site generator
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- **Markdown**: [Marked.js](https://marked.js.org/) - Markdown parser
- **Icons**: [Lucide](https://lucide.dev/) - Beautiful icon library
- **Hosting**: GitHub Pages (ready to deploy)

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ (recommended: 20+)
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
   Navigate to `http://localhost:4321`

## 📁 Project Structure

```
src/
├── content/
│   └── notes/          # Your markdown notes
├── layouts/
│   └── Layout.astro    # Main layout component
├── pages/
│   ├── index.astro     # Home page
│   ├── notes.astro     # Notes listing
│   ├── til.astro       # Today I Learned
│   └── progress.astro  # Progress tracker
└── styles/
    └── global.css      # Global styles and Tailwind
```

## 📝 Adding Notes

1. **Create a new markdown file** in `src/content/notes/`
2. **Add frontmatter** with metadata:

```markdown
---
title: "Your Note Title"
description: "Brief description of the note"
tags: ["tag1", "tag2", "tag3"]
date: "2024-01-15"
readTime: "5 min read"
category: "algorithms"
difficulty: "intermediate"
---

# Your Note Content

Write your markdown content here...
```

3. **Categories available**: `algorithms`, `system-design`, `python`, `devops`, `frontend`, `ai-ml`, `trading`

## 🎨 Customization

### Colors and Theme

Edit `tailwind.config.mjs` to customize colors:

```javascript
theme: {
  extend: {
    colors: {
      primary: {
        50: '#f0f9ff',
        // ... your custom colors
      }
    }
  }
}
```

### Layout

Modify `src/layouts/Layout.astro` to change the overall site structure.

### Styling

Update `src/styles/global.css` for custom CSS components.

## 🚀 Deployment

### GitHub Pages

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Deploy automatically**
   ```bash
   npm run deploy
   ```

3. **Configure GitHub Pages**
   - Go to your repository settings
   - Enable GitHub Pages
   - Set source to "GitHub Actions" (recommended) or "Deploy from a branch"

### Other Platforms

The built site in `dist/` can be deployed to:
- Netlify
- Vercel
- Cloudflare Pages
- Any static hosting service

## 📊 Features in Detail

### Home Page
- Hero section with call-to-action
- Quick stats overview
- Featured notes showcase
- Category exploration
- Recent TIL posts

### Notes Section
- Grid layout with note cards
- Search functionality
- Category and difficulty filters
- Tag-based organization
- Responsive design

### TIL (Today I Learned)
- Micro-posts about daily learnings
- Category filtering
- Chronological organization
- Quick insights and tips

### Progress Tracker
- Learning path visualization
- Progress bars and statistics
- Recent achievements
- Upcoming goals
- Motivation section

## 🎯 Learning Paths

The site includes predefined learning paths for:

- **🔢 Algorithms & Data Structures** - Core CS concepts
- **🏗️ System Design** - Architecture and scalability
- **🐍 Python Mastery** - Language-specific skills
- **⚙️ DevOps & Tools** - Infrastructure and deployment
- **🤖 AI/ML Fundamentals** - Machine learning basics
- **📈 Trading Systems** - Financial technology

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run deploy` - Build and deploy to GitHub Pages

### Adding New Features

1. **New Pages**: Add `.astro` files to `src/pages/`
2. **Components**: Create reusable components in `src/components/`
3. **Styles**: Add custom styles to `src/styles/global.css`
4. **Content**: Add markdown files to `src/content/notes/`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Astro.js](https://astro.build/) for the amazing static site generator
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework
- [Lucide](https://lucide.dev/) for the beautiful icons
- The open-source community for inspiration and tools

## 📞 Contact

- **GitHub**: [@Tuhin-SnapD](https://github.com/Tuhin-SnapD)
- **Website**: [Your GitHub Pages URL]

---

**Happy Learning! 🚀**

*"The best way to learn is to teach, and the best way to teach is to document."*
