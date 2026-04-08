import { defineConfig } from 'vite'

export default defineConfig({
  base: './',
  server: {
    port: 5174,
    host: '0.0.0.0'
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true
  }
})
