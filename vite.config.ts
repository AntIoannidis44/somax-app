import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Served from https://antioannidis44.github.io/somax-app/
export default defineConfig({
  plugins: [react()],
  base: '/somax-app/',
})
