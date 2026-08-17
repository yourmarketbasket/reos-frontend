import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath, URL } from 'node:url';

// Production API base URL (Nisoko deployment)
const API_BASE_URL = process.env.VITE_API_BASE_URL || 'https://reos-api-ortox.deployments.nisoko.co.ke';

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  define: {
    // Expose the API base URL to the app at build time
    __API_BASE_URL__: JSON.stringify(API_BASE_URL)
  },
  build: {
    // Raise warning threshold (we're splitting, so it's expected)
    chunkSizeWarningLimit: 600,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.warn']
      }
    },
    rollupOptions: {
      output: {
        // Split large vendor libraries into separate cacheable chunks
        manualChunks(id) {
          if (id.includes('node_modules/vue') || id.includes('node_modules/vue-router')) {
            return 'vue-core';
          }
          if (id.includes('node_modules/pinia')) {
            return 'pinia';
          }
          if (id.includes('node_modules/chart.js') || id.includes('node_modules/vue-chartjs')) {
            return 'charts';
          }
          if (id.includes('node_modules/leaflet')) {
            return 'leaflet';
          }
          if (id.includes('node_modules/')) {
            return 'vendor';
          }
        }
      }
    }
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: API_BASE_URL,
        changeOrigin: true,
        secure: true
      }
    }
  }
});

