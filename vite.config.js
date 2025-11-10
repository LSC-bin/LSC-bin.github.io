import { defineConfig } from 'vite';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const pages = {
  index: resolve(__dirname, 'index.html'),
  chat: resolve(__dirname, 'chat.html'),
  activity: resolve(__dirname, 'activity-session.html'),
  ask: resolve(__dirname, 'ask-session.html'),
  classSelect: resolve(__dirname, 'class-select.html'),
  createSession: resolve(__dirname, 'create-session.html'),
  login: resolve(__dirname, 'login.html'),
  session: resolve(__dirname, 'session.html')
};

export default defineConfig({
  appType: 'mpa',
  root: __dirname,
  server: {
    port: 5173,
    open: 'index.html'
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: pages
    }
  }
});
