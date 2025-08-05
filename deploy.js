#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting deployment process...');

try {
  // Build the project
  console.log('📦 Building project...');
  execSync('npm run build', { stdio: 'inherit' });
  
  // Check if dist folder exists
  if (!fs.existsSync('dist')) {
    throw new Error('Build failed: dist folder not found');
  }
  
  // Deploy to GitHub Pages
  console.log('🌐 Deploying to GitHub Pages...');
  execSync('npx gh-pages -d dist', { stdio: 'inherit' });
  
  console.log('✅ Deployment completed successfully!');
  console.log('🌍 Your site should be available at: https://tuhin-snapd.github.io');
  
} catch (error) {
  console.error('❌ Deployment failed:', error.message);
  process.exit(1);
} 