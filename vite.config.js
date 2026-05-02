import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react'; // o el que uses
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  // --- ESTO ARREGLA EL ERROR DE RAILWAY ---
  server: {
    allowedHosts: [
      'tunutrisofi-production.up.railway.app',
      '.localhost' // permite también localhost
    ]
  },
  preview: {
    allowedHosts: [
      'tunutrisofi-production.up.railway.app'
    ]
  }
});