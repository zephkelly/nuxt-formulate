<template>
    <div class="container" style="display: flex; flex-direction: column; gap: 1rem;">
        <h1>Zod Test</h1>
        <input
            placeholder="Name"
        />

        <p>
            <span class="state"></span>
        </p>
    </div>

    <div class="container" style="display: flex; flex-direction: column; gap: 1rem;">
        <h1>Valibot Test</h1>
        <input
            v-model="valibotState.name"
            placeholder="Name"
        />

        <p>
            <span class="state">{{ valibotState }}</span>
        </p>
    </div>

    <div class="container" style="display: flex; flex-direction: column; gap: 1rem;">
        <h1>Arktype Test</h1>
        <input
            v-model="arktypeState.name"
            placeholder="Name"
        />

        <p>
            <span class="state">{{ arktypeState }}</span>
        </p>
    </div>
</template>

<script lang="ts" setup>
// Zod testing
import * as z from 'zod'

const zodSchema = z.interface({
    string: z.string(),
    number: z.number(),
    int: z.int(),
    boolean: z.boolean(),
    date: z.date(),
    bigint: z.bigint(),
    array: z.array(z.string()),
    array2: z.array(z.interface({
        name: z.string(),
        age: z.number().int().positive()
    })),
})

const {
    state: zodState,
} = useFormulate(z.array(zodSchema))



// // Valibot testing
import * as v from 'valibot'

const valibotSchema = v.object({
    name: v.pipe(v.string(), v.minLength(1)),
    age: v.pipe(v.number(), v.minValue(18))
});
const {
    state: valibotState,
} = useFormulate(valibotSchema)



// Arktype testing
import { type } from "arktype"

const arktypeSchema = type({
	name: "string > 1",
    age: "number > 18",
})

const {
    state: arktypeState,
} = useFormulate(arktypeSchema)

</script>

<style lang="css">
html body {
    background-color: black;
}

p {
    color: white;
}
</style>