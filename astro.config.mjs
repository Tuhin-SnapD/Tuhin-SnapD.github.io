// @ts-check
import { defineConfig } from 'astro/config';
import netlify from '@astrojs/netlify';

// https://astro.build/config
export default defineConfig({
  site: 'https://tuhin-snapd.github.io',
  base: '/',
  output: 'server',
  adapter: netlify(),
  integrations: [],
  markdown: {
    shikiConfig: {
      theme: 'github-dark',
      wrap: true
    }
  },
  experimental: {
    contentCollectionCache: false
  }
});
