export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: [
    'nuxt-windicss',
  ],
  css: [
    'virtual:windi.css',
  ],
  app: {
    head: {
      title: '传统古乐律吕校准工具',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: '中国传统古乐律吕校准与音律研究工具' }
      ]
    }
  }
})
