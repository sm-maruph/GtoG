import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite builds to dist/, not build/. IIS points at web/dist.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Dev only. In production IIS + ARR proxies these to 127.0.0.1:4000.
      '/api':       { target: 'http://localhost:4000', changeOrigin: true },
      '/socket.io': { target: 'http://localhost:4000', ws: true },
    },
  },
  build: { outDir: 'dist', sourcemap: false },
});
