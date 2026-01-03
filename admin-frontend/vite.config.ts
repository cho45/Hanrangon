import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
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
