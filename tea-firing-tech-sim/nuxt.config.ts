// https://nuxt.com/docs/api/configuration/nuxt-config
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  css: [join(__dirname, 'assets/styles/main.scss')],
  vite: {
    resolve: {
      alias: {
        '~': __dirname,
        '@': __dirname
      }
    },
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `@use "${join(__dirname, 'assets/styles/variables.scss').replace(/\\/g, '/')}" as *;\n`
        }
      }
    }
  }
})
