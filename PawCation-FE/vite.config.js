import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Backend Laravel (php artisan serve)
const BACKEND = 'http://127.0.0.1:8000'

// Request /api dan /storage diteruskan ke Laravel lewat dev server Vite.
// Karena FE & API jadi satu origin, browser tidak lagi mengirim request
// CORS preflight (OPTIONS) sebelum setiap panggilan API -> jauh lebih cepat.
const proxy = {
  '/api': { target: BACKEND, changeOrigin: true },
  '/storage': { target: BACKEND, changeOrigin: true },
}

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    host: '127.0.0.1',
    port: 5173,
    proxy,
    // Pre-transform semua halaman saat dev server start, jadi pindah
    // halaman pertama kali tidak menunggu Vite meng-compile dulu.
    warmup: {
      clientFiles: ['./src/pages/**/*.jsx', './src/components/*.jsx', './src/lib/*.js'],
    },
  },
  preview: {
    host: '127.0.0.1',
    port: 4173,
    proxy,
  },
})
