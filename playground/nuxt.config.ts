export default defineNuxtConfig({
    modules: ['../src/module'],
    formulate: {
        validators: [
            "zod"
        ],
        defaultValueOptions: {
            arrays: 'populate',
        }
    },
    devtools: { enabled: true },
})
