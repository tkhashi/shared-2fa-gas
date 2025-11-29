import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';

export default defineConfig({
  plugins: [
    react({
      tsDecorators: true,
    }),
    viteSingleFile(), // すべてのJS/CSSをHTMLにインライン化
  ],
  build: {
    outDir: 'dist/client',
    emptyOutDir: true,
    rollupOptions: {
      input: 'index-client.html',
    },
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
});
