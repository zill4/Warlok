import { defineConfig } from 'vite'
import checker from 'vite-plugin-checker'

export default defineConfig({
  root: '.',
  base: '/',
  plugins: [
    checker({
      typescript: true,
    }),
  ],
  server: {
    headers: {
        'Cross-Origin-Opener-Policy': 'same-origin',
        'Cross-Origin-Embedder-Policy': 'require-corp',
    },
    port: 3000
  },
build: {
    target: 'esnext',
}
}) 