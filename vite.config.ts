import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
      server: {
        port: 3002,
        host: '127.0.0.1',
      },
      base: './',
      plugins: [react()],
      resolve: {
        alias: {
          '@': path.resolve(import.meta.dirname, '.'),
        }
      }
});
