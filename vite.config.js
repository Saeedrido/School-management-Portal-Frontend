import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  server: { port: 3000, proxy: { '/api': 'http://localhost:64677' } },
  build: { outDir: 'build' },
  // Never ship console output (tokens, passwords, user data can leak through it)
  esbuild: mode === 'production' ? { drop: ['console', 'debugger'] } : {},
}))