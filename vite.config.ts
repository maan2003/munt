import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import tailwind from 'tailwindcss'

export default defineConfig({
  plugins: [svelte()],
  css: {
    postcss: {
      plugins: [
        tailwind(),
      ],
    },
  },
})
