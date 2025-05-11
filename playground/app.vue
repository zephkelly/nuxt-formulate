<template>
    <form class="container" style="display: flex; flex-direction: column; gap: 1rem;">
        <h1>Zod Test</h1>
        <input
            v-model="state.string.isDirty"
            :class="{
                dirty: meta.string.isDirty?.isDirty$ ,
                error: error.string.isDirty
            }"
            placeholder="Name"
            
        />

        <input
            v-model="state.number"
            :class="{ dirty: meta.number.isDirty$ }"
            placeholder="Name"
        />

        <p>
            <span class="state">{{ state }}</span>
        </p>
    </form>
</template>

<script lang="ts" setup>
// Zod testing
import * as z from 'zod'

const zodSchema = z.interface({
    string: z.interface({
        isDirty: z.number(),
        numberNested: z.number(),
    }).partial(),
    number: z.number(),
    array: z.array(z.string()),
})

const {
    state,
    meta,
    error
} = useAutoForm(zodSchema, {

})

watch(error, (newError) => {
    console.error('Error', newError.string)
}, { deep: true, immediate: true })

watch(state, (newState) => {
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

input.error {
    border-color: red;
} 
</style>