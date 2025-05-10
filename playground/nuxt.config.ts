export default defineNuxtConfig({
    modules: ['../src/module'],
    formulate: {
        validators: [
            "zod"
        ],
        defaultValueOptions: {
            arrays: {
                method: 'populate',
                depth: {
                    layers: [0, 2],
                    fallback: 'empty'
                }
            }
        }
    },
    devtools: { enabled: true },
})
