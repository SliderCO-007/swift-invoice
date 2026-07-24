import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vuetify from 'vite-plugin-vuetify';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  base: '/',
  plugins: [
    vue(),
    vuetify({ autoImport: true }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('firebase')) return 'vendor-firebase';
            if (id.includes('vuetify') || id.includes('@mdi')) return 'vendor-vuetify';
            if (id.includes('chart.js') || id.includes('vue-chartjs')) return 'vendor-charts';
            if (id.includes('jspdf') || id.includes('html2canvas') || id.includes('purify')) return 'vendor-pdf';
            if (id.includes('vue') || id.includes('vue-router') || id.includes('@vueuse')) return 'vendor-core';
          }
        }
      }
    }
  }
});
