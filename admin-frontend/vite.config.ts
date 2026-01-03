import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    svelte({
      compilerOptions: {
        customElement: true,
      },
    }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/main.ts'),
      name: 'AdminFront',
      fileName: 'admin-front',
      formats: ['es'],
    },
    outDir: '../static/admin',
    emptyOutDir: true,
    sourcemap: true,
  },
  server: {
    origin: 'http://localhost:5173',
  },
});