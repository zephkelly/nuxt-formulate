//@ts-ignore
import { registerAdapters } from "#nuxt-formulate/formulate-adapters.mjs";

//@ts-ignore
import { defineNitroPlugin } from '#imports';



//@ts-ignore
export default defineNitroPlugin((nitroApp) => {
    registerAdapters()
});