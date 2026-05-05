import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Proxy direct vers le backend FastAPI — utilisé si BASE_URL pointe vers Vite
      '/auth': { target: 'http://localhost:8000', changeOrigin: true },
      '/users': { target: 'http://localhost:8000', changeOrigin: true },
      '/todos': { target: 'http://localhost:8000', changeOrigin: true },
    },
  },
})
