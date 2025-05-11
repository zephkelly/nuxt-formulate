<template>
    <form class="container" style="display: flex; flex-direction: column; gap: 1rem;">
        <h1>Zod Test</h1>
        <input
            :class="{ dirty: meta.string.numberNested.isDirty }"
            v-model="zodState.string.numberNested"
            placeholder="Name"
            
        />

        <input
            v-model="zodState.number"
            :class="{ dirty: meta.number.isDirty}"
            placeholder="Name"
        />

        <p>
            <span class="state">{{ zodState }}</span>
        </p>
    </form>
</template>

<script lang="ts" setup>
// Zod testing
import type { error } from 'console'
import * as z from 'zod'

const zodSchema = z.interface({
    string: z.interface({
        stringNested: z.string(),
        numberNested: z.number(),
    }),
    number: z.number(),
    array: z.array(z.string()),
})

const {
    state: zodState,
    meta,
} = useAutoForm(zodSchema, {

})

watch(zodState, (state) => {
    console.log('Meta', meta.value)
}, { deep: true, immediate: true })
</script>

<style lang="css">
html body {
    background-color: black;
}

p {
    color: white;
}

input {
    outline: none;
    border: 4px solid white;
    border-radius: 6px;
}

input.dirty {
    border-color: purple;    
}
</style>