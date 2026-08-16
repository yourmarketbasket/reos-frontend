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
