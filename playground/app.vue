<template>
    <div class="container" style="display: flex; flex-direction: column; gap: 1rem;">
        <h1>Zod Test</h1>
        <input
            placeholder="Name"
        />

        <p>
            <span class="state">{{ zodState }}</span>
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
    name: z.string().min(1, 'Name is required'),
    age: z.number().min(18, 'You must be at least 18 years old')
})
const {
    state: zodState,
} = useFormulate(z.array(zodSchema), {
    // defaults: [{
    //     name: 0,
    //     age: 0
    // }]
})



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