# 🤝 Contributing to DevNotes

Thank you for your interest in contributing to DevNotes! This guide will help you understand how to add new notes, improve the site, and maintain the knowledge garden.

## 📝 Adding New Notes

### 1. Create a New Note File

Create a new markdown file in `src/content/notes/` with a descriptive filename:

```bash
# Example: for a note about React hooks
touch src/content/notes/react-hooks.md
```

### 2. Add Frontmatter

Every note must include frontmatter with metadata:

```markdown
---
title: "React Hooks Deep Dive"
description: "Understanding useState, useEffect, and custom hooks in React"
tags: ["react", "javascript", "frontend", "hooks"]
date: "2024-01-20"
readTime: "10 min read"
category: "frontend"
difficulty: "intermediate"
---
```

### 3. Write Your Content

Use standard Markdown with some enhancements:

```markdown
# React Hooks Deep Dive

## Introduction

React Hooks revolutionized how we write functional components...

## useState Hook

The `useState` hook allows functional components to manage state...

```javascript
import React, { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
    </div>
  );
}
```

## Key Takeaways

- Hooks must be called at the top level
- Only call hooks from React functions
- Use the dependency array in useEffect
```

### 4. Available Categories

Use one of these predefined categories:

- `algorithms` - Data structures, algorithms, problem-solving
- `system-design` - Architecture, scalability, distributed systems
- `python` - Python-specific topics, libraries, best practices
- `devops` - Git, Docker, CI/CD, deployment
- `frontend` - HTML, CSS, JavaScript, frameworks
- `backend` - Server-side development, APIs, databases
- `ai-ml` - Machine learning, artificial intelligence
- `trading` - Financial systems, low-latency trading

### 5. Difficulty Levels

Choose the appropriate difficulty:

- `beginner` - Basic concepts, introductory material
- `intermediate` - Moderate complexity, practical applications
- `advanced` - Complex topics, expert-level content

## 🏷️ Tagging Guidelines

### Tag Best Practices

1. **Be Specific**: Use descriptive tags that help with search
2. **Use Lowercase**: All tags should be lowercase
3. **Use Hyphens**: Separate words with hyphens (e.g., `machine-learning`)
4. **Limit Count**: Use 3-6 tags per note
5. **Be Consistent**: Use existing tags when possible

### Common Tags

#### Languages & Frameworks
- `javascript`, `typescript`, `python`, `java`, `go`, `rust`
- `react`, `vue`, `angular`, `nodejs`, `express`
- `django`, `flask`, `spring`, `fastapi`

#### Concepts
- `algorithms`, `data-structures`, `design-patterns`
- `system-design`, `microservices`, `distributed-systems`
- `performance`, `optimization`, `security`
- `testing`, `debugging`, `deployment`

#### Tools & Platforms
- `git`, `docker`, `kubernetes`, `aws`, `gcp`
- `postgresql`, `mongodb`, `redis`, `elasticsearch`
- `jenkins`, `github-actions`, `terraform`

## 📊 Progress Tracking

### Updating Learning Paths

To update the progress tracker, edit `src/pages/progress.astro`:

```javascript
const learningPaths = [
  {
    name: "Your Learning Path",
    icon: "🔧",
    progress: 75, // Percentage (0-100)
    totalTopics: 20,
    completedTopics: 15,
    currentTopic: "Current Topic Name",
    nextTopic: "Next Topic Name",
    difficulty: "intermediate",
    estimatedCompletion: "2 weeks"
  }
];
```

### Adding Achievements

Add new achievements to the `recentAchievements` array:

```javascript
const recentAchievements = [
  {
    title: "Completed Your Topic",
    date: "2024-01-20",
    category: "your-category",
    description: "Brief description of what was accomplished"
  }
];
```

## 🎨 Styling Guidelines

### CSS Classes

Use the predefined Tailwind classes:

- `.card` - For content cards
- `.btn-primary` - Primary buttons
- `.btn-secondary` - Secondary buttons
- `.tag` - For tags and badges
- `.search-input` - For search inputs

### Custom Components

If you need custom styling, add it to `src/styles/global.css`:

```css
@layer components {
  .your-custom-class {
    @apply bg-blue-100 text-blue-800 rounded-lg px-3 py-1;
  }
}
```

## 🔧 Development Setup

### Prerequisites

- Node.js 18.20.8+ or 20+
- npm or yarn

### Local Development

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

4. **Open in browser**
   Navigate to `http://localhost:4321`

### Building for Production

```bash
npm run build
npm run preview
```

## 📋 Code Review Process

### Before Submitting

1. **Test locally**
   - Ensure the site builds without errors
   - Check that new notes display correctly
   - Verify responsive design on different screen sizes

2. **Check formatting**
   - Use consistent markdown formatting
   - Ensure proper frontmatter
   - Validate tags and categories

3. **Update documentation**
   - Update README if adding new features
   - Add comments for complex code
   - Update progress tracking if needed

### Pull Request Guidelines

1. **Create a descriptive title**
   ```
   feat: add React hooks tutorial
   fix: resolve search functionality
   docs: update deployment guide
   ```

2. **Write a detailed description**
   ```markdown
   ## Changes Made
   - Added comprehensive React hooks tutorial
   - Included practical examples and best practices
   - Updated progress tracking for frontend category

   ## Testing
   - [x] Site builds successfully
   - [x] New note displays correctly
   - [x] Search functionality works
   - [x] Responsive design maintained
   ```

3. **Request review**
   - Tag relevant reviewers
   - Provide context for changes
   - Be responsive to feedback

## 🐛 Bug Reports

### Reporting Issues

When reporting bugs, include:

1. **Environment details**
   - Operating system
   - Node.js version
   - Browser (if applicable)

2. **Steps to reproduce**
   - Clear, step-by-step instructions
   - Expected vs actual behavior

3. **Additional context**
   - Screenshots if applicable
   - Console errors
   - Network tab information

### Issue Template

```markdown
## Bug Description
Brief description of the issue

## Steps to Reproduce
1. Go to '...'
2. Click on '...'
3. Scroll down to '...'
4. See error

## Expected Behavior
What should happen

## Actual Behavior
What actually happens

## Environment
- OS: [e.g. Windows 10]
- Node.js: [e.g. 20.0.0]
- Browser: [e.g. Chrome 120]

## Additional Context
Any other context about the problem
```

## 💡 Feature Requests

### Suggesting Features

When suggesting new features:

1. **Describe the problem**
   - What issue does this solve?
   - Who would benefit from this feature?

2. **Propose a solution**
   - How should this feature work?
   - Any specific implementation ideas?

3. **Consider impact**
   - How will this affect existing functionality?
   - What are the maintenance implications?

### Feature Request Template

```markdown
## Problem Statement
Describe the problem this feature would solve

## Proposed Solution
Describe how this feature should work

## Benefits
- Benefit 1
- Benefit 2
- Benefit 3

## Implementation Ideas
Any thoughts on how to implement this

## Alternatives Considered
Other approaches you've considered
```

## 📚 Content Guidelines

### Writing Style

1. **Be Clear and Concise**
   - Use simple, direct language
   - Avoid unnecessary jargon
   - Include practical examples

2. **Structure Your Content**
   - Use clear headings and subheadings
   - Break content into digestible sections
   - Include a table of contents for long articles

3. **Include Code Examples**
   - Provide working code snippets
   - Explain what each part does
   - Include comments for clarity

### Content Quality

1. **Accuracy**
   - Verify all information is correct
   - Include references when appropriate
   - Test code examples

2. **Completeness**
   - Cover the topic thoroughly
   - Include edge cases and exceptions
   - Provide next steps for learning

3. **Accessibility**
   - Use descriptive alt text for images
   - Ensure proper heading hierarchy
   - Write clear link text

## 🎯 Learning Paths

### Creating New Learning Paths

To add a new learning path:

1. **Define the scope**
   - What topics will be covered?
   - What's the target audience?
   - How long should it take to complete?

2. **Structure the content**
   - Break into logical modules
   - Define prerequisites
   - Set learning objectives

3. **Update the progress tracker**
   - Add to `learningPaths` array
   - Set initial progress values
   - Define difficulty level

### Example Learning Path

```javascript
{
  name: "Web Development Fundamentals",
  icon: "🌐",
  progress: 0,
  totalTopics: 15,
  completedTopics: 0,
  currentTopic: "HTML Basics",
  nextTopic: "CSS Fundamentals",
  difficulty: "beginner",
  estimatedCompletion: "3 months"
}
```

## 🔄 Maintenance

### Regular Tasks

1. **Update dependencies**
   ```bash
   npm update
   npm audit fix
   ```

2. **Review and update content**
   - Check for outdated information
   - Update broken links
   - Refresh examples and code

3. **Monitor performance**
   - Run Lighthouse audits
   - Check Core Web Vitals
   - Optimize images and assets

### Content Review Schedule

- **Weekly**: Review recent additions
- **Monthly**: Update progress tracking
- **Quarterly**: Major content audit
- **Annually**: Technology stack review

## 📞 Getting Help

### Resources

- [Astro Documentation](https://docs.astro.build)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Markdown Guide](https://www.markdownguide.org/)

### Community

- Create an issue for questions
- Join discussions in pull requests
- Share your learnings with the community

---

**Thank you for contributing to DevNotes!** 🚀

*"The best way to learn is to teach, and the best way to teach is to document."* 