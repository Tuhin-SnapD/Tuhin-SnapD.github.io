---
title: "Tailwind CSS Grid Layouts"
description: "Mastering CSS Grid with Tailwind CSS utility classes"
tags: ["tailwind", "css", "grid", "frontend", "layout"]
date: "2024-01-19"
category: "frontend"
published: true
---

# Tailwind CSS Grid Layouts

Today I learned how to create powerful grid layouts using Tailwind CSS utility classes.

## Basic Grid Setup

```html
<div class="grid grid-cols-3 gap-4">
  <div class="bg-blue-500 p-4">Item 1</div>
  <div class="bg-blue-500 p-4">Item 2</div>
  <div class="bg-blue-500 p-4">Item 3</div>
</div>
```

## Responsive Grids

```html
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  <!-- Items will stack on mobile, 2 columns on medium, 3 on large -->
</div>
```

## Auto-Fit Grids

```html
<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
  <!-- Automatically fits items based on container width -->
</div>
```

## Grid Areas

```html
<div class="grid grid-cols-12 gap-4">
  <header class="col-span-12 bg-gray-200 p-4">Header</header>
  <aside class="col-span-3 bg-gray-300 p-4">Sidebar</aside>
  <main class="col-span-9 bg-gray-100 p-4">Main Content</main>
  <footer class="col-span-12 bg-gray-200 p-4">Footer</footer>
</div>
```

## Key Takeaways

- Use `grid-cols-{n}` for fixed columns
- Use responsive prefixes for adaptive layouts
- `gap-{size}` controls spacing between items
- `col-span-{n}` for spanning multiple columns
- `row-span-{n}` for spanning multiple rows

Tailwind makes CSS Grid much more approachable! 