
import { type Ref, ref, watch } from 'vue';
import { useState } from 'nuxt/app';

import type { SchemaType, InferSchemaType } from '../../shared/types/schema';

import { createDefaultValues } from '../../shared/utils/validator';
import type { DefaultValueGenerationOptions } from '../../shared/types/defaults';



 ///////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////                                                                ////////
////////                      **  FORMULATE  **                         ////////
////////              The simple form management library                ////////
////////                                                                ////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////



/**
 * Options for the useFormulate hook
 */
export type FormulateOptions<TSchema extends SchemaType> = {
    /**
     * Initial state values to override defaults
     */
    defaults?: Partial<InferSchemaType<TSchema>>;

    /**
     * Options for controlling default value generation behavior
     */
    autoDefaults?: DefaultValueGenerationOptions;
    
    /**
     * A partial schema to use for validation during form editing
     * If not provided, one will be created automatically
     */
    partialSchema?: Partial<InferSchemaType<TSchema>>;
  
    /**
     * Optional data key for persistence or identification
     * Used when the function is called with a string as the first argument
     */
    key?: string;
};



// -- Composable Parameters
// -----------------------------------------------------------------------------
type NormalisedFormulateParams<TSchema extends SchemaType> = {
    schema: TSchema;
    externalRef?: Ref<InferSchemaType<TSchema>>;
    options: FormulateOptions<TSchema>;
};

/**
 * Normalises the parameters passed to useFormulate
 */
function normaliseFormulateParams<TSchema extends SchemaType>(
    schemaOrKey: string | TSchema,
    schemaOrRefOrOptions?: TSchema | Ref<InferSchemaType<TSchema> | undefined | null> | FormulateOptions<TSchema>,
    refOrOptions?: Ref<InferSchemaType<TSchema>> | FormulateOptions<TSchema>,
    options?: FormulateOptions<TSchema>
): NormalisedFormulateParams<TSchema> {
    const result: NormalisedFormulateParams<TSchema> = {
        schema: {} as TSchema,
        options: {}
    };
    
    // -- First parameter is a string key
    if (typeof schemaOrKey === 'string') {
        const dataKey = schemaOrKey;
        result.schema = schemaOrRefOrOptions as TSchema;
        
        if (refOrOptions && typeof refOrOptions === 'object' && 'value' in refOrOptions) {
            result.externalRef = refOrOptions as Ref<InferSchemaType<TSchema>>;
            result.options = options || {};
        } else {
            result.options = refOrOptions as FormulateOptions<TSchema> || {};
        }
        
        result.options.key = dataKey;
    }
    // -- First parameter is a schema
    else {
        result.schema = schemaOrKey;
        
        if (schemaOrRefOrOptions && typeof schemaOrRefOrOptions === 'object' && 'value' in schemaOrRefOrOptions) {
            result.externalRef = schemaOrRefOrOptions as Ref<InferSchemaType<TSchema>>;
            result.options = refOrOptions as FormulateOptions<TSchema> || {};
        } else {
            result.options = schemaOrRefOrOptions as FormulateOptions<TSchema> || {};
        }
    }
    
    return result;
}


/**
 * Creates initial form state based on schema, defaults, and external ref
 */
function createInitialState<TSchema extends SchemaType>(
    schema: TSchema,
    externalRef?: Ref<InferSchemaType<TSchema>>,
    defaults: Partial<InferSchemaType<TSchema>> = {},
    defaultsOptions?: DefaultValueGenerationOptions
): InferSchemaType<TSchema> {
    type FormState = InferSchemaType<TSchema>;
   
    let defaultValues: FormState;
   
    if (schema) {
        defaultValues = createDefaultValues<FormState>(schema, defaultsOptions);
    } else {
        defaultValues = (externalRef && externalRef.value)
            ? { ...externalRef.value } as FormState
            : {} as FormState;
    }
   
    if (Array.isArray(defaultValues)) {
        if (Array.isArray(defaults)) {
            return [...defaultValues, ...defaults] as unknown as FormState;
        }
        return defaultValues;
    }
    
    // Original handling for objects
    return (
        typeof defaultValues === 'object' && defaultValues !== null
            ? { ...defaultValues, ...defaults }
            : defaults as unknown as FormState
    );
}



export function useAutoForm<TSchema extends SchemaType>(
    schemaOrKey: string | TSchema,
    schemaOrRefOrOptions?: TSchema | Ref<InferSchemaType<TSchema> | undefined | null> | FormulateOptions<TSchema>,
    refOrOptions?: Ref<InferSchemaType<TSchema>> | FormulateOptions<TSchema>,
    options?: FormulateOptions<TSchema>
) {
    const { schema, externalRef, options: formOptions } = normaliseFormulateParams(
        schemaOrKey,
        schemaOrRefOrOptions,
        refOrOptions,
        options
    );
    
    const {
        defaults,
        autoDefaults,
        partialSchema,
        key
    } = formOptions;
    
    type FormState = InferSchemaType<TSchema>;
    
    const mergedInitialValues = createInitialState(
        schema, 
        externalRef, 
        defaults, 
        autoDefaults
    );

    let state: Ref<FormState>;
    
    // -- External ref provided - use it directly
    if (externalRef) {
        if (Object.keys(externalRef.value || {}).length === 0) {
            externalRef.value = mergedInitialValues as FormState;
        }
        
        state = externalRef;
    } 
    // -- Key provided without external ref - use useState
    else if (key) {
        state = useState<FormState>(key, () => mergedInitialValues as FormState);
    } 
    // -- No key, no external ref - use local ref
    else {
        state = ref(mergedInitialValues) as Ref<FormState>;
    }
    
    return {
        state,
    };
}