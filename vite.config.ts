import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: Number(process.env.VITE_PORT) || 6060,
    strictPort: false
  },
  preview: {
    port: Number(process.env.VITE_PORT) || 6060,
    strictPort: false
  }
})
