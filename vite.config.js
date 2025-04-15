import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/soul-stage-github-pages-complete/',
  plugins: [react()],
})
