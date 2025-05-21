<template>
    <div class="container" style="display: flex; flex-direction: column; gap: 1rem;">
        <h1>Zod Test</h1>
        <input
            v-model="zodState.string"
            placeholder="Name"
            type="text"
            :class="{
                dirty: zodMetadata.string.isDirty$,
                valid: zodMetadata.string.isValid$,
            }"
        />

        <p>{{ zodErrors?.string }}</p>
    </div>
</template>

<script lang="ts" setup>
// Zod testing
import { z } from 'zod/v4'

const zodSchema = z.object({
    string: z.number(),
    number: z.number(),
    int: z.int(),
    boolean: z.boolean(),
    date: z.date(),
    bigint: z.bigint(),
})

const {
    state: zodState,
    metadata: zodMetadata,
    errors: zodErrors,
} = useAutoForm(zodSchema)
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