<template>
    <div class="container" style="display: flex; flex-direction: column; gap: 1rem;">
        <h1>Zod Test</h1>
        <input
            v-model="zodState.string"
            placeholder="Name"
        />

        <input
            v-model="zodState.number"
            placeholder="Name"
        />

        <p>
            <span class="state">{{ zodState }}</span>
        </p>
    </div>
</template>

<script lang="ts" setup>
// Zod testing
import * as z from 'zod'

const zodSchema = z.interface({
    string: z.string(),
    number: z.number(),
    array: z.array(z.string()),
})

const {
    state: zodState,
    meta
} = useAutoForm(zodSchema, {
    
})

watch(zodState, (state) => {
    console.log('zodState', state)
    console.log('zodState meta', meta)
    // try {
    //     zodSchema.parse(state)
    // } catch (e) {
    //     console.error('zod error app.vue:', e)
    // }

}, { deep: true, immediate: true })
</script>

<style lang="css">
html body {
    background-color: black;
}

p {
    color: white;
}
</style>