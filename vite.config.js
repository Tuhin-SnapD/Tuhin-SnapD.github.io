import { defineConfig } from 'vite';

export default defineConfig(({ command }) => {
  // Use base path only for production builds (GitHub Pages)
  // For development, use '/' to avoid WebSocket/HMR issues
  const base = command === 'serve' ? '/' : '/Tuhin-SnapD.github.io/';

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

