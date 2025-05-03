import {
    defineNuxtModule,
    addPlugin,
    addImportsDir,
    createResolver
} from '@nuxt/kit'

// Module options TypeScript interface definition
export interface ModuleOptions {}

export default defineNuxtModule<ModuleOptions>({
    meta: {
        name: 'my-module',
        configKey: 'myModule',
    },
    defaults: {},
    setup(_options, _nuxt) {
        const resolver = createResolver(import.meta.url)

        addImportsDir(resolver.resolve('runtime/app/composables'))

        addPlugin(resolver.resolve('./runtime/plugin'))
    },
})
