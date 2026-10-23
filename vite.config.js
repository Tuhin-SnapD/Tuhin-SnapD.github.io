import { defineConfig } from 'vite';

export default defineConfig(() => {
  // This repository is a GitHub *user* site (Tuhin-SnapD.github.io), so it is
  // published at the domain root rather than under /Tuhin-SnapD.github.io/.
  const base = '/';

  return {
    base,
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: false,
      rollupOptions: {
        output: {
          manualChunks: {
            phaser: ['phaser']
          }
        }
      }
    },
    // Enable sourcemaps in dev mode for debugging
    esbuild: {
      sourcemap: 'inline'
    },
    server: {
      port: 3000,
      open: true
    }
  };
});

