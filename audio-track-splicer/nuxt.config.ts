export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: [
    '@unocss/nuxt',
    '@vueuse/nuxt'
  ],
  css: [
    '@unocss/reset/tailwind.css'
  ],
  unocss: {
    uno: true,
    attributify: true,
    icons: true
  }
})
