export default defineNuxtConfig({
    modules: ['../src/module'],
    formulate: {
        validators: [
            "zod"
        ],
        defaultValueOptions: {
            primitives: 'undefined',
            arrays: {
                method: 'populate',
                depth: {
                    max: 1,
                }
            }
        }
    },
    devtools: { enabled: true },
})
