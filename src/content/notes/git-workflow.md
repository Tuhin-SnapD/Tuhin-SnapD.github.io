---
title: "Git Workflow Best Practices"
description: "Essential Git commands and workflows for team collaboration"
tags: ["git", "workflow", "collaboration", "version-control"]
date: "2024-01-08"
readTime: "8 min read"
category: "devops"
difficulty: "beginner"
published: true
featured: false
---

# Git Workflow Best Practices

Git is the most popular version control system, but using it effectively requires understanding proper workflows and best practices. This guide covers essential Git workflows for team collaboration.

## Git Flow Workflow

Git Flow is a popular branching model that provides a robust framework for managing larger projects.

### Main Branches

- **main/master**: Contains production-ready code
- **develop**: Integration branch for features

### Supporting Branches

- **feature/***: New features
- **release/***: Preparing for a new production release
- **hotfix/***: Urgent fixes for production

## Feature Branch Workflow

### 1. Create a Feature Branch

```bash
# Start from develop branch
git checkout develop
git pull origin develop

# Create and switch to feature branch
git checkout -b feature/user-authentication
```

### 2. Make Changes and Commit

```bash
# Make your changes
git add .
git commit -m "feat: add user authentication system

- Implement JWT token authentication
- Add login/logout functionality
- Include password reset feature"
```

### 3. Push and Create Pull Request

```bash
git push origin feature/user-authentication
```

Then create a Pull Request on GitHub/GitLab.

## Commit Message Convention

Use conventional commits for better project history:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Types

- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, etc.)
- **refactor**: Code refactoring
- **test**: Adding or updating tests
- **chore**: Maintenance tasks

### Examples

```bash
git commit -m "feat(auth): add OAuth2 authentication"
git commit -m "fix(api): resolve user data fetching issue"
git commit -m "docs(readme): update installation instructions"
```

## Essential Git Commands

### Basic Commands

```bash
# Initialize repository
git init

# Clone repository
git clone <repository-url>

# Check status
git status

# Add files to staging
git add <filename>
git add .  # Add all files

# Commit changes
git commit -m "commit message"

# Push to remote
git push origin <branch-name>

# Pull latest changes
git pull origin <branch-name>
```

### Branching Commands

```bash
# List branches
git branch

# Create new branch
git branch <branch-name>

# Switch to branch
git checkout <branch-name>
# or (Git 2.23+)
git switch <branch-name>

# Create and switch to new branch
git checkout -b <branch-name>

# Delete branch
git branch -d <branch-name>
```

### Advanced Commands

```bash
# View commit history
git log --oneline --graph

# Reset to previous commit
git reset --hard HEAD~1

# Stash changes
git stash
git stash pop

# Merge branches
git merge <branch-name>

# Rebase branch
git rebase <branch-name>
```

## Best Practices

### 1. Keep Commits Atomic

Each commit should represent a single logical change:

```bash
# Good: Separate commits for different concerns
git commit -m "feat: add user registration form"
git commit -m "test: add unit tests for registration"
git commit -m "docs: update API documentation"

# Bad: Everything in one commit
git commit -m "add user registration and tests and docs"
```

### 2. Use Descriptive Commit Messages

```bash
# Good
git commit -m "fix(auth): prevent SQL injection in login form"

# Bad
git commit -m "fix bug"
```

### 3. Regular Pulls

Always pull the latest changes before starting work:

```bash
git checkout develop
git pull origin develop
git checkout feature/my-feature
git rebase develop
```

### 4. Use .gitignore

Create a comprehensive `.gitignore` file:

```gitignore
# Dependencies
node_modules/
vendor/

# Environment files
.env
.env.local

# Build outputs
dist/
build/

# IDE files
.vscode/
.idea/

# OS files
.DS_Store
Thumbs.db
```

### 5. Code Review Process

1. Create feature branch
2. Make changes and commit
3. Push and create Pull Request
4. Request code review
5. Address feedback
6. Merge after approval

## Common Workflows

### Hotfix Workflow

```bash
# Create hotfix branch from main
git checkout main
git pull origin main
git checkout -b hotfix/critical-bug

# Fix the issue
git add .
git commit -m "fix: resolve critical authentication bug"

# Merge to main and develop
git checkout main
git merge hotfix/critical-bug
git push origin main

git checkout develop
git merge hotfix/critical-bug
git push origin develop

# Delete hotfix branch
git branch -d hotfix/critical-bug
```

### Release Workflow

```bash
# Create release branch
git checkout develop
git checkout -b release/v1.2.0

# Make release-specific changes
git commit -m "chore: bump version to 1.2.0"

# Merge to main and develop
git checkout main
git merge release/v1.2.0
git tag v1.2.0
git push origin main --tags

git checkout develop
git merge release/v1.2.0
git push origin develop

# Delete release branch
git branch -d release/v1.2.0
```

## Troubleshooting

### Undo Last Commit

```bash
# Keep changes in working directory
git reset --soft HEAD~1

# Discard changes completely
git reset --hard HEAD~1
```

### Fix Merge Conflicts

```bash
# During merge conflict
git status  # See conflicted files
# Edit files to resolve conflicts
git add <resolved-files>
git commit -m "resolve merge conflicts"
```

### Recover Deleted Branch

```bash
# Find the commit hash
git reflog

# Recreate branch
git checkout -b <branch-name> <commit-hash>
```

## Tools and Extensions

### Git Hooks

Use pre-commit hooks for code quality:

```bash
# Install pre-commit
pip install pre-commit

# Create .pre-commit-config.yaml
repos:
  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v4.4.0
    hooks:
      - id: trailing-whitespace
      - id: end-of-file-fixer
      - id: check-yaml
      - id: check-added-large-files
```

### Git Aliases

Add useful aliases to your `.gitconfig`:

```ini
[alias]
    st = status
    co = checkout
    br = branch
    ci = commit
    lg = log --oneline --graph --decorate
    unstage = reset HEAD --
    last = log -1 HEAD
```

## Key Takeaways

- Use meaningful branch names and commit messages
- Keep commits atomic and focused
- Regular pulls prevent merge conflicts
- Code reviews improve code quality
- Git Flow provides structure for larger projects
- Use tools like pre-commit hooks for consistency 