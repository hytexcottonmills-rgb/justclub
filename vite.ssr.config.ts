import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
  ssr: {
    noExternal: ['motion', 'lucide-react'],
  },
  build: {
    ssr: 'src/entry-prerender.tsx',
    outDir: 'dist-ssr',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        entryFileNames: 'entry-prerender.js',
        format: 'esm',
      },
    },
  },
});
