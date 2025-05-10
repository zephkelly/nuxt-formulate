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
    int: z.literal([1, 2]),
    boolean: z.boolean(),
    date: z.date(),
    bigint: z.bigint(),
    array: z.array(z.string()),
    array2: z.array(z.interface({
        name: z.string(),
        age: z.number().int().positive(),
        nestedObject: z.interface({
            name: z.string(),
            age: z.number().int().positive()
        })
    })),
})

const {
    state: zodState,
} = useAutoForm(z.array(zodSchema))

watch(zodState, (state) => {
    console.log('Zod state:', state)
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