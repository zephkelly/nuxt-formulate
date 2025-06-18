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


        <button @click="testCall">Test API Call</button>
    </div>
</template>

<script lang="ts" setup>
import { z } from 'zod/v4'

import { discriminatedUnionSchema, DiscriminatedUnionValidator, mockDiscriminatedUnionData } from './shared/schemas/test';
import { ValidationError } from '#nuxt-formulate';

console.log('Testing disc union')
const testDiscriminatedUnion = useValidator(discriminatedUnionSchema)
try {
    const testDiscriminatedUnion = DiscriminatedUnionValidator.validateArray(mockDiscriminatedUnionData)
    console.log('Discriminated Union Validation Success:', testDiscriminatedUnion)
}
catch (error) {
    console.error('Discriminated Union Validation Error:', error)
    if (error instanceof ValidationError) {
        console.error('Validation errors:', error.errors)
    } else {
        console.error('Unexpected error:', error)
    }
}
console.log('Discriminated Union Test:', testDiscriminatedUnion)


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


async function testCall() {
    try {
        const response = await $fetch('/api/test')
        console.log('API response:', response)
    }
    catch (error) {
        console.error('API call failed:', error)
    }
}
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