import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Logic: Vite bundler configuration for FuraOJ React Single Page Application.
// Input: Vite user configuration options.
// Output: Resolved Vite configuration object with React plugin and dev proxy.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: '0.0.0.0',
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8080',
        changeOrigin: true
      },
      '/ws': {
        target: 'ws://127.0.0.1:8080',
        ws: true
      }
    }
  },
  preview: {
    port: 3000,
    host: '0.0.0.0'
  }
});
