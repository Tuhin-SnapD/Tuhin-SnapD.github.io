# 🚀 Deployment Guide

This guide will help you deploy your DevNotes site to various platforms.

## GitHub Pages (Recommended)

### Automatic Deployment with GitHub Actions

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit: DevNotes site"
   git push origin main
   ```

2. **Enable GitHub Pages**
   - Go to your repository on GitHub
   - Navigate to **Settings** → **Pages**
   - Under **Source**, select **GitHub Actions**
   - The workflow will automatically build and deploy your site

3. **Access your site**
   - Your site will be available at: `https://yourusername.github.io/your-repo-name`
   - For a user/organization site: `https://yourusername.github.io`

### Manual Deployment

If you prefer manual deployment:

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Deploy using the provided script**
   ```bash
   npm run deploy
   ```

3. **Configure GitHub Pages**
   - Go to **Settings** → **Pages**
   - Set source to **Deploy from a branch**
   - Select the `gh-pages` branch (if using the deploy script)

## Other Deployment Options

### Netlify

1. **Connect your repository**
   - Sign up/login to [Netlify](https://netlify.com)
   - Click **New site from Git**
   - Connect your GitHub repository

2. **Configure build settings**
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
   - **Node version**: `20`

3. **Deploy**
   - Netlify will automatically build and deploy your site
   - You'll get a custom URL like: `https://your-site-name.netlify.app`

### Vercel

1. **Import your project**
   - Sign up/login to [Vercel](https://vercel.com)
   - Click **New Project**
   - Import your GitHub repository

2. **Configure settings**
   - **Framework Preset**: Astro
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

3. **Deploy**
   - Vercel will automatically deploy your site
   - You'll get a custom URL like: `https://your-project.vercel.app`

### Cloudflare Pages

1. **Connect repository**
   - Sign up/login to [Cloudflare Pages](https://pages.cloudflare.com)
   - Click **Create a project**
   - Connect your GitHub repository

2. **Configure build settings**
   - **Framework preset**: Astro
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`

3. **Deploy**
   - Cloudflare will build and deploy your site
   - You'll get a custom URL like: `https://your-project.pages.dev`

## Environment Variables

If you need to set environment variables for your deployment:

### GitHub Pages
- Go to **Settings** → **Secrets and variables** → **Actions**
- Add your environment variables

### Netlify
- Go to **Site settings** → **Environment variables**
- Add your variables

### Vercel
- Go to **Project settings** → **Environment variables**
- Add your variables

## Custom Domain

### GitHub Pages
1. Go to **Settings** → **Pages**
2. Under **Custom domain**, enter your domain
3. Add a CNAME record pointing to `yourusername.github.io`

### Netlify
1. Go to **Domain settings**
2. Click **Add custom domain**
3. Follow the DNS configuration instructions

### Vercel
1. Go to **Settings** → **Domains**
2. Add your domain
3. Configure DNS as instructed

## Troubleshooting

### Build Failures

1. **Check Node.js version**
   ```bash
   node --version
   ```
   Ensure you're using Node.js 18.20.8+ or 20+

2. **Clear cache and reinstall**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **Check for errors**
   ```bash
   npm run build
   ```

### Deployment Issues

1. **Check GitHub Actions logs**
   - Go to **Actions** tab in your repository
   - Click on the failed workflow
   - Review the error logs

2. **Verify build output**
   - Ensure the `dist` folder is generated
   - Check that all files are present

3. **Check file permissions**
   - Ensure all files are committed to Git
   - Verify `.gitignore` isn't excluding necessary files

### Common Issues

1. **404 errors on GitHub Pages**
   - Ensure your repository is public
   - Check that the correct branch is selected
   - Verify the build completed successfully

2. **Styling issues**
   - Check that Tailwind CSS is properly configured
   - Ensure all CSS files are being loaded

3. **Search not working**
   - Verify JavaScript is enabled
   - Check browser console for errors

## Performance Optimization

### Build Optimization

1. **Enable compression**
   ```javascript
   // astro.config.mjs
   export default defineConfig({
     build: {
       assets: '_assets',
       inlineStylesheets: 'auto'
     }
   });
   ```

2. **Optimize images**
   - Use WebP format when possible
   - Compress images before adding to the site

3. **Minimize dependencies**
   - Remove unused packages
   - Use tree-shaking effectively

### SEO Optimization

1. **Add meta tags**
   - Update the Layout component with proper meta tags
   - Add Open Graph and Twitter Card meta tags

2. **Create a sitemap**
   ```bash
   npm install @astrojs/sitemap
   ```

3. **Add robots.txt**
   ```txt
   User-agent: *
   Allow: /
   Sitemap: https://yoursite.com/sitemap.xml
   ```

## Monitoring

### Analytics

1. **Google Analytics**
   - Add Google Analytics tracking code to your Layout
   - Configure goals and events

2. **GitHub Pages Analytics**
   - Enable GitHub Pages analytics in repository settings

### Performance Monitoring

1. **Lighthouse**
   - Run Lighthouse audits regularly
   - Monitor Core Web Vitals

2. **Real User Monitoring**
   - Consider tools like Sentry for error tracking
   - Monitor page load times

## Security

1. **HTTPS**
   - All major platforms provide HTTPS by default
   - Ensure your custom domain has SSL certificate

2. **Content Security Policy**
   - Add CSP headers to prevent XSS attacks
   - Configure allowed sources for scripts and styles

3. **Dependencies**
   - Regularly update dependencies
   - Use `npm audit` to check for vulnerabilities

## Backup Strategy

1. **Version Control**
   - All code is backed up in Git
   - Use feature branches for development

2. **Content Backup**
   - Keep local copies of your markdown files
   - Consider using a CMS for easier content management

3. **Database Backup** (if applicable)
   - If you add a database later, implement regular backups

---

**Need help?** Check the [Astro documentation](https://docs.astro.build) or create an issue in the repository. 