import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import compression from 'vite-plugin-compression'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    compression({
      algorithm: 'gzip',
      ext: '.gz',
    }),
  ],

  server: {
    port: 5173,
  },

  build: {
    // ✅ Force esbuild and prevent terser usage
    minify: 'esbuild',

    // ✅ Drop console + debugger in production
    esbuild: {
      drop: ['console', 'debugger'],
    },

    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'mui-vendor': [
            '@mui/material',
            '@mui/icons-material',
            '@emotion/react',
            '@emotion/styled'
          ],
          'chart-vendor': ['recharts'],
          'utils-vendor': ['axios', 'xlsx'],
        },
        // Optimize chunk file names for better caching
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
      },
    },

    chunkSizeWarningLimit: 1000,
    
    // Enable source maps for production debugging (optional - can disable for smaller builds)
    sourcemap: false,
    
    // Optimize asset inlining
    assetsInlineLimit: 4096, // Inline assets smaller than 4kb
  },

  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@mui/material',
      '@mui/icons-material',
    ],
  },
})
