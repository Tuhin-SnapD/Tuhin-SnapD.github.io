import { defineConfig } from 'vite'
import compression from 'vite-plugin-compression'

export default defineConfig({
  base: process.env.NODE_ENV === 'production' ? '/Tuhin-SnapD.github.io/' : '/',
  server: {
    host: true,
    port: 3000,
    hmr: {
      port: 3000
    },
    // Add force option to prevent cache issues
    force: true
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.warn'],
        passes: 2
      },
      mangle: {
        toplevel: true
      }
    },
    rollupOptions: {
      output: {
        manualChunks: {
          three: ['three'],
          gsap: ['gsap'],
          lottie: ['lottie-web'],
          vendor: ['three', 'gsap']
        },
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.')
          const ext = info[info.length - 1]
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
            return `images/[name]-[hash][extname]`
          }
          return `assets/[name]-[hash][extname]`
        }
      }
    },
    chunkSizeWarningLimit: 500
  },
  optimizeDeps: {
    include: ['three', 'gsap'],
    exclude: ['lottie-web'],
    // Add force option to force re-optimization
    force: true,
    // Add esbuild options for better compatibility
    esbuildOptions: {
      target: 'es2020'
    }
  },
  plugins: [
    compression({
      algorithm: 'gzip',
      ext: '.gz'
    }),
    compression({
      algorithm: 'brotliCompress',
      ext: '.br'
    })
  ]
}) 