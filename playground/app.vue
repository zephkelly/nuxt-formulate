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

const myTestRef = z.interface({
    name: z.string().min(1, 'Name is required'),
    age: z.number().min(18, 'You must be at least 18 years old')
})

type MyTestRef = z.infer<typeof myTestRef>

const {
    state,
    errors
} = useFormulate<typeof myTestRef>(myTestRef)

watch(state, (newState) => {
    console.log('State changed:', newState)
}, { deep: true, immediate: true })


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