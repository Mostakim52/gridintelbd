import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Relative base so the built `dist/` works from any static host,
// including a GitHub Pages project sub-path.
export default defineConfig({
  base: './',
  plugins: [react()],
})
