import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  publicDir: 'assets',
  build: {
    assetsDir: 'app-assets',
    rollupOptions: {
      input: 'app.html',
    },
  },
})
