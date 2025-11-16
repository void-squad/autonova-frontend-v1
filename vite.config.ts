import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

export default defineConfig(() => ({
  server: {
    host: '::',
    proxy: {
      '/api': {
        // Forward frontend /api requests to the API gateway (port 8080).
        // The gateway is responsible for routing to the actual services (e.g. book-appointment-service on 8088).
        target: 'http://localhost:8080', // Gateway base URL
        changeOrigin: true,
        secure: false,
      },
    },
  },
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
}));
