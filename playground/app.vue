<template>
    <div class="container" style="display: flex; flex-direction: column; gap: 1rem;">
        <h1>Zod Test</h1>
        <p>{{ zodState }}</p>
        <input 
            v-model="zodState.string"
            placeholder="Name"
            type="text"
            :class="{
                dirty: zodMetadata.string.isDirty$,
                }"
        />
        <p>{{ zodErrors?.string }}</p>
        {{ zodErrors }}


    </div>
</template>

<script lang="ts" setup>
import { z } from 'zod/v4'

const zodSchema = z.object({
    string: z.number(),
    number: z.number(),
    int: z.int(),
    boolean: z.boolean(),
})

const {
    state: zodState,
    meta: zodMetadata,
    error: zodErrors,
} = useAutoForm(zodSchema)

watch(zodErrors, (newValue) => {
    console.log('zodErrors', newValue)
}, { deep: true })
</script>

<style lang="css">
html body {
    background-color: black;
}

p {
    color: white;
}

input {
    &.dirty {
        border: 4px solid purple;
    }
}
</style>