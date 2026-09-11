import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Repo is a project page (username != tourneyboss.github.io),
// so it is served under /tourneyboss.github.io/ — base must match.
export default defineConfig({
  plugins: [react()],
  base: '/tourneyboss.github.io/',
})
