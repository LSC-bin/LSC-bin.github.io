import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, '../src'),
      '@components': resolve(__dirname, '../src/components'),
      '@services': resolve(__dirname, '../src/services'),
      '@styles': resolve(__dirname, '../src/styles'),
      '@utils': resolve(__dirname, '../src/utils'),
      '@hooks': resolve(__dirname, '../src/hooks'),
      '@types': resolve(__dirname, '../src/types'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'utils': ['dompurify', 'zod'],
        },
      },
    },
    sourcemap: true,
  },
  server: {
    port: 3000,
    open: true,
  },
});
