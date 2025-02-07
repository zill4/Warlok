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
    port: 3000
  }
}) 