<template>
    <h1>Hello World</h1>
    <input v-model="state.billingInfo" placeholder="Name" />

    {{ state }}
</template>

<script lang="ts" setup>


import { UserProfileSchema } from '@/types/test';

const {
    state,
    errors
} = useFormulate(UserProfileSchema, {
    defaults: {
        billingInfo: {
            paymentMethod: 'credit_card',
            accountBalance: 1,
            transactions: [],
            billingAddress: {
                street: '',
                city: '',
                state: '',
                zipCode: '',
                country: '',
                isPrimary: false,
                validUntil: undefined
            }
        }
    }
});



watch(errors, (newValue) => {
    console.log('errors:', newValue);
});

// watch(() => errors, (newValue) => {
//     console.log('Errors:', newValue);
// });

// watch(
//     () => stateArray.user.id,
//     (newValue) => {
//         console.log('New value:', newValue);
//     }
// );
</script>