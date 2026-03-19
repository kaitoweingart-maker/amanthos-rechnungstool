import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    nodePolyfills({
      include: ['buffer', 'stream', 'util', 'events', 'zlib', 'process', 'string_decoder', 'path'],
      globals: { Buffer: true, process: true },
    }),
  ],
  base: process.env.GITHUB_ACTIONS ? '/amanthos-rechnungstool/' : '/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      // Use standalone build with inlined font data (browser-compatible)
      pdfkit: path.resolve(__dirname, './node_modules/pdfkit/js/pdfkit.standalone.js'),
    },
  },
})
