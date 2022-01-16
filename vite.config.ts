import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    // port: 8989,
  },
  resolve: {
    alias: {
      '@': 'src',
    },
  },
  plugins: [],
});
