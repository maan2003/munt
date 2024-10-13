import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import tailwind from 'tailwindcss'
import topLevelAwait from 'vite-plugin-top-level-await'

export default defineConfig({
  plugins: [svelte(), topLevelAwait()],
  css: {
    postcss: {
      plugins: [
        tailwind(),
      ],
    },
  },
})
