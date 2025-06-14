import { defineNuxtPlugin } from '#imports'

import { registerAdapters } from '#build/formulate-adapters.mjs'
import moduleOptions from '#build/formulate-options.mjs'



export default defineNuxtPlugin((nuxtApp) => {
    registerAdapters()
   
    nuxtApp.provide('$formulate', {
        options: moduleOptions,
    })
   
    return {
        provide: {
            formulate: {
                options: moduleOptions,
            }
        }
    }
})