import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    viteSingleFile(), // すべてのJS/CSSをHTMLにインライン化
  ],
  build: {
    outDir: 'dist',
    emptyOutDir: false, // Code.jsを消さないようにfalseに
    rollupOptions: {
      input: path.resolve(__dirname, 'index.html'),
    },
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
});
