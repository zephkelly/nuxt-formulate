<template>
    <div class="container" style="display: flex; flex-direction: column; gap: 1rem;">
        <h1>Zod Test</h1>
        <p>{{ zodState }}</p>
        <button @click="zodState.push({})">Add</button>
        <div class="container" v-for="(item, index) in zodState" :key="index">
            <input 
                v-model="zodState[index].string"
                placeholder="Name"
                type="text"
                :class="{
                    dirty: zodMetadata.items[index]?.string.isDirty$,
                 }"
            />
            <p>{{ index }}</p>
            <p>{{ zodMetadata.items[index]?.string }}</p>
        </div>


    </div>
</template>

<script lang="ts" setup>
// Zod testing
import { z } from 'zod/v4'

const zodSchema = z.array(z.object({
    string: z.number(),
    number: z.number(),
    int: z.int(),
    boolean: z.boolean(),
    date: z.date(),
    bigint: z.bigint(),
}))

const {
    state: zodState,
    metadata: zodMetadata,
    errors: zodErrors,
} = useAutoForm(zodSchema, {
    defaultValueOptions: {
        arrays: {
            method: 'populate',
            length: 2,
        }
    },
})
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