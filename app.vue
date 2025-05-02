<template>
    <h1>Hello World</h1>
    <input v-model="state.name" placeholder="Name" />

    {{ state }}
    {{ errors }}
</template>

<script lang="ts" setup>
import * as z from 'zod';

const TestSchema = z.object({
    name: z.string().min(1, { message: 'Name is required' }),
    age: z.number().min(18, { message: 'You must be at least 18 years old' }),
});

const stateGlobal = useState<z.infer<typeof TestSchema> | undefined>('state-global-test', () => undefined);

const {
    state,
    errors
} = useFormulate('state-global-test', TestSchema);


watch(stateGlobal, (newValue) => {
    console.log('stateGlobal:', newValue);
}, { deep: true });


watch(state, (newValue) => {
    console.log('stateLocal:', newValue);
}, { deep: true });
</script>