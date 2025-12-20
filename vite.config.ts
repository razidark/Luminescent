
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    // Injeta a API_KEY do ambiente de build para o código cliente
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY),
  },
});
