import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    port: 8989,
  },
  resolve: {
    alias: {
      '@': 'src',
    },
  },
  plugins: [react()],
});
