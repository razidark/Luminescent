
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    // Usamos um fallback para garantir que o código não quebre se process.env não existir,
    // mas evitamos forçar um valor estático se ele for undefined no build.
    'process.env.API_KEY': process.env.API_KEY ? JSON.stringify(process.env.API_KEY) : 'window.process?.env?.API_KEY || ""',
  },
});
