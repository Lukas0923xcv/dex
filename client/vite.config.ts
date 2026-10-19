import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // Ensures assets load correctly on GitHub Pages (/dex/) and Docker (/)
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    // The bundled dataset (~2 MB) is plain JSON and is a single chunk by design
    chunkSizeWarningLimit: 2500,
    rollupOptions: {
      output: {
        // Split rarely-changing code/data from app code so a UI update doesn't
        // force users to re-download the whole Pokémon dataset (and vice versa)
        manualChunks(id) {
          if (id.includes('pokemon-data.json')) return 'pokemon-data';
          if (id.includes('pokemonObtainData')) return 'obtain-data';
          if (id.includes('node_modules')) return 'vendor';
          return undefined;
        }
      }
    }
  }
});
