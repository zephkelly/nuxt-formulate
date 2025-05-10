<template>
    <div class="container" style="display: flex; flex-direction: column; gap: 1rem;">
        <h1>Zod Test</h1>
        <input
            placeholder="Name"
        />

        <p>
            <span class="state">{{  }}</span>
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

const partialZodSchema = zodSchema.partial()

console.log('Zod schema:', zodSchema)
console.log('Partial Zod schema:', partialZodSchema)

const {
    state: zodState,
} = useAutoForm(zodSchema)

watch(zodState, (state) => {
    console.log('zod state:', state)
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