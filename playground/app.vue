<template>
    <div class="container" style="display: flex; flex-direction: column; gap: 1rem;">
        <h1>Zod Test</h1>
        <p>{{ zodState }}</p>
        <input 
            v-model="zodState.string"
            placeholder="Name"
            type="text"
            :class="{
                dirty: zodMetadata.string?.isDirty$,
                }"
        />
        <p>{{ zodErrors?.string }}</p>

        <input 
            v-model="zodState.number"
            placeholder="Number"
            type="number"
            :class="{
                dirty: zodMetadata.number?.isDirty$,
                }"
        />
        <p>{{ zodErrors?.number }}</p>

        <input 
            v-model="zodState.int"
            placeholder="Int"
            type="number"
            :class="{
                dirty: zodMetadata.int?.isDirty$,
                }"
        />
        <p>{{ zodErrors?.int }}</p>

        <input 
            v-model="zodState.boolean"
            placeholder="Boolean"
            type="checkbox"
            :class="{
                dirty: zodMetadata.boolean?.isDirty$,
                }"
        />
        <p>{{ zodErrors?.boolean }}</p>


    </div>
</template>

<script lang="ts" setup>
import { z } from 'zod/v4'
import type { StandardSchemaV1 } from '../src/runtime/shared/types/standard-schema/v1'

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

const validator = useValidator(zodSchema)

watch(zodState, (newValue) => {
    try {
        const data = validator.asyncValidatePartial(zodState.value)
        console.log('Validation successful:', data)
    }
    catch (error) {
        console.error('Validation error:', error)
    }
}, { deep: true })

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