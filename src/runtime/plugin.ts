import { defineNuxtPlugin } from 'nuxt/app'

export default defineNuxtPlugin((_nuxtApp) => {
    console.log('Plugin injected by my-module!')
})