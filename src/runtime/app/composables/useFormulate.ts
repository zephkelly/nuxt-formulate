
import { type Ref, ref, watch } from 'vue';
import { useState } from 'nuxt/app';

import type { SchemaType, InferSchemaType } from './../../shared/types/schema';

import {
    createDefaultValues,
} from './../../shared/utils/validator';




 ///////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////                                                                ////////
////////                      **  FORMULATE  **                         ////////
////////       The simple form management and validation library        ////////
////////                                                                ////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

/**
 * Options for the useFormulate hook
 */
type FormulateOptions<TSchema extends SchemaType> = {
    /**
     * Initial state values to override defaults
     */
    defaults?: Partial<InferSchemaType<TSchema>>;
    
    /**
     * A partial schema to use for validation during form editing
     * If not provided, one will be created automatically
     */
    partialSchema?: Partial<InferSchemaType<TSchema>>;
    
    /**
     * Validation debounce timing in milliseconds
     */
    validationDebounce?: number;
  
    /**
     * Optional data key for persistence or identification
     * Used when the function is called with a string as the first argument
     */
    key?: string;
};


export function useFormulate<TSchema extends SchemaType>(
    schemaOrKey: string | TSchema,
    schemaOrRefOrOptions?: TSchema | Ref<InferSchemaType<TSchema> | undefined | null> | FormulateOptions<TSchema>,
    refOrOptions?: Ref<InferSchemaType<TSchema>> | FormulateOptions<TSchema>,
    options?: FormulateOptions<TSchema>
) {
    let schema: TSchema;
    let externalRef: Ref<InferSchemaType<TSchema>> | undefined;
    let formOptions: FormulateOptions<TSchema> = {};
    
    if (typeof schemaOrKey === 'string') {
        const dataKey = schemaOrKey;
        schema = schemaOrRefOrOptions as TSchema;
        
        if (refOrOptions && typeof refOrOptions === 'object' && 'value' in refOrOptions) {
            externalRef = refOrOptions as Ref<InferSchemaType<TSchema>>;
            formOptions = options || {};
        }
        else {
            formOptions = refOrOptions as FormulateOptions<TSchema> || {};
        }
        
        formOptions.key = dataKey;
    }
    else {
        schema = schemaOrKey;
        
        if (schemaOrRefOrOptions && typeof schemaOrRefOrOptions === 'object' && 'value' in schemaOrRefOrOptions) {
            externalRef = schemaOrRefOrOptions as Ref<InferSchemaType<TSchema>>;
            formOptions = refOrOptions as FormulateOptions<TSchema> || {};
        }
        else {
            formOptions = schemaOrRefOrOptions as FormulateOptions<TSchema> || {};
        }
    }
    
    const {
        //@ts-ignore
        defaults = {},
        partialSchema,
        key
    } = formOptions;
    
    type FormState = InferSchemaType<TSchema>;
    
    let defaultValues: FormState;
    if (schema) {
        defaultValues = createDefaultValues<FormState>(schema);
        console.log('defaultValues', defaultValues);
    }
    else {
        defaultValues = (externalRef && externalRef.value) 
        ? { ...externalRef.value } as FormState 
        : {} as FormState;
    }
    
    const mergedInitialValues = (
        typeof defaultValues === 'object' && defaultValues !== null
          ? { ...defaultValues, ...defaults }
          : defaults as unknown as FormState
    );
    
    let state: Ref<FormState>;
    
    if (externalRef) {
        if (Object.keys(externalRef.value || {}).length === 0) {
            externalRef.value = mergedInitialValues as FormState;
        }

        state = externalRef;
        
        if (key) {
            const persistentState = useState<FormState>(key, () => externalRef.value);
            
            watch(externalRef, (newVal) => {
                persistentState.value = newVal;
            }, { deep: true });
            
            watch(persistentState, (newVal) => {
                externalRef.value = newVal;
            }, { deep: true });
        }
    }
    else if (key) {
        state = useState<FormState>(key, () => mergedInitialValues as FormState);
    }
    else {
        //@ts-ignore
        state = ref(mergedInitialValues) as Ref<FormState>;
    }
    
    return {
        state,
    };
}