<template>
    <h1>Hello World</h1>
    <input v-model="state.email" placeholder="Name" />

    {{ state }}
    {{ errors }}
</template>

<script lang="ts" setup>
import * as z from 'zod';
import * as v from 'valibot'; 

// Create login schema with email and password
const LoginSchema = v.object({
    email: v.pipe(v.string(), v.email()),
    password: v.pipe(v.string(), v.minLength(8)),
});

const TestSchema = z.object({
    name: z.string().min(1, { message: 'Name is required' }),
    age: z.number().min(18, { message: 'You must be at least 18 years old' }),
});


const {
    state,
    errors
} = useFormulate(LoginSchema);


watch(errors, (newValue) => {
    console.log('stateLocal:', newValue);
}, { deep: true });
</script>