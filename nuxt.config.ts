// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  // Private layer: dashboard, agent pages, proprietary composables
  // Enabled by default in dev, disabled in public production builds
  // To build public-only: A2NUI_PRIVATE=false npm run build
  extends: process.env.A2NUI_PRIVATE !== 'false' ? ['./layers/private'] : [],

  modules: [
    '@nuxt/eslint',
    '@nuxt/image',
    '@nuxt/ui',
    '@nuxt/content'
  ],

  devtools: {
    enabled: true
  },

  css: ['~/assets/css/main.css'],

  content: {
    build: {
      markdown: {
        toc: {
          searchDepth: 1
        }
      }
    }
  },

  nitro: {
    prerender: {
      routes: ['/'],
      crawlLinks: true,
      autoSubfolderIndex: false
    }
  },

  icon: {
    provider: 'iconify'
  },

  compatibilityDate: '2025-01-15',

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  }
})
