
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    // Vite requires defines to be valid JS expressions. 
    // We use a simple stringified value to avoid esbuild parsing errors during Vercel deployment.
    // If process.env.API_KEY is available at build time (e.g. Vercel env vars), it is baked in.
    // Otherwise, it evaluates to "" which is safe and avoids crashes.
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY || ""),
  },
});
