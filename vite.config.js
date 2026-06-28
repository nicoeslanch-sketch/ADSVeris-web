import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  publicDir: 'assets',
  build: {
    assetsDir: 'app-assets',
    rollupOptions: {
      input: {
        app: 'app.html',
        'kommo-widget': 'src/kommo-widget.jsx',
      },
      output: {
        entryFileNames: 'app-assets/[name].js',
        chunkFileNames: 'app-assets/[name]-[hash].js',
        assetFileNames: 'app-assets/[name]-[hash][extname]',
      },
    },
  },
})
