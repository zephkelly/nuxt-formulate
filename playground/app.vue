<template>
    <div class="container" style="display: flex; flex-direction: column; gap: 1rem;">
        <input
            v-model="state.name"
            :error="errors.name"
            placeholder="Name"
        />

        <p>
            <span class="state">{{ state }}</span>
            <span class="error">{{ errors }}</span>
        </p>
    </div>
</template>

<script lang="ts" setup>
import * as z from 'zod'

const Schema = z.interface({
    name: z.number().min(1),
    age: z.number().min(18),
    email: z.email(),
})

const {
    state,
    errors
} = useFormulate(Schema)

watch(state, (newState) => {
    console.log('State changed:', newState)
}, { deep: true })


// No auto validation happening yet
// watch(errors, (newErrors) => {
//     console.log('Errors changed:', newErrors)
// }, { deep: true })
</script>

<style lang="css">
html body {
    background-color: black;
}

p {
    color: white;
}
</style>