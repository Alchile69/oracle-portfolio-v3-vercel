import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path'; // AJOUTEZ CETTE LIGNE

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  resolve: { // AJOUTEZ CETTE SECTION
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  // 🔍 ACTIVATION DES SOURCE MAPS POUR DEBUG PRODUCTION
  build: {
    sourcemap: true, // Active les source maps en production
    rollupOptions: {
      output: {
        // Garde les noms de fonctions pour un meilleur debugging
        manualChunks: undefined,
      },
    },
  },
  // 🔍 CONFIGURATION DE DEBUG
  define: {
    __DEV__: JSON.stringify(process.env.NODE_ENV === 'development'),
  },
});