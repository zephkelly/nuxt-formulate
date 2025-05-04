export default defineNuxtConfig({
    modules: ['../src/module'],
    formulate: {
        validators: [
            "zod"
        ],
    },
    devtools: { enabled: true },
})
