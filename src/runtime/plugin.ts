import { defineNuxtPlugin } from '#app'

import { registerAdapters } from '#build/formulate-adapters.mjs'
import moduleOptions from '#build/formulate-options.mjs'



export default defineNuxtPlugin((nuxtApp) => {
    registerAdapters()
   
    nuxtApp.provide('$formulate', {
        options: moduleOptions
    })
   
    return {
        provide: {
            formulate: {
                options: moduleOptions
            }
        }
    }
})