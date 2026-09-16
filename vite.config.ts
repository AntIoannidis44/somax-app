import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Served from Cloudflare Pages at the domain root.
export default defineConfig({
  plugins: [react()],
})
