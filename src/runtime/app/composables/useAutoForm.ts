
import { type Ref, ref, watch, toRaw } from 'vue';
import { useState } from 'nuxt/app';

import { debounce } from '../../shared/utils/debounce';

import type { SchemaType, InferSchemaType } from '../../shared/types/schema';
import type { DefaultValueGenerationOptions } from '../../shared/types/defaults';
import type { MetaStateType } from '../../shared/types/meta';
import type { ErrorStateType } from '../../shared/types/error';

import { mergeWithGlobalOptions } from '../../shared/utils/options';
import { updateAllDirtyStates } from '../../shared/utils/core/meta';
import {
    createDefaultValues,
    createPartialSchema,
    createMetaState,
    syncArraysWithMetaState,
    handleValidate
} from '../../shared/utils/core';

import { updateValidationStates } from '../../shared/utils/core/meta';



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
     * Optional data key for persistence or identification
     * Used when the function is called   a string as the first argument
     */
    key?: string;

    /**
     * Initial state values to override defaults
     * 
     * @deprecated Dont use this for now, broken as
     */
    defaults?: Partial<InferSchemaType<TSchema>>;

    /**
     * Options for controlling default value generation behavior
     */
    defaultValueOptions?: DefaultValueGenerationOptions;

    /**
     * Schema options for different validation scenarios
     */
    schemas?: {
        /**
         * A partial schema to use for validation during form editing
         * If not provided, fallback to partialSchema or auto-generated one
         */
        partial?: SchemaType;
    };
};



// -- Composable Parameters
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
    defaultValueOptions?: DefaultValueGenerationOptions
): InferSchemaType<TSchema> {
    type FormState = InferSchemaType<TSchema>;
   
    let defaultValues: FormState;
   
    if (schema) {
        const mergedDefaultValueOptions = mergeWithGlobalOptions(defaultValueOptions);

        defaultValues = createDefaultValues<FormState>(schema, mergedDefaultValueOptions);
    }
    else {
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


function createPartialFromSchema<TSchema extends SchemaType>(schema: TSchema) {
    if (schema) {
        const newPartialSchema = createPartialSchema(schema);
        return newPartialSchema;
    }
    
    return {} as Partial<InferSchemaType<TSchema>>;
}



export function useAutoForm<TSchema extends SchemaType>(
    schemaOrKey: string | TSchema,
    schemaOrRefOrOptions?: TSchema | Ref<InferSchemaType<TSchema> | undefined | null> | FormulateOptions<TSchema>,
    refOrOptions?: Ref<InferSchemaType<TSchema>> | FormulateOptions<TSchema>,
    options?: FormulateOptions<TSchema>
) {
    // -- Option handling
    const { schema, externalRef, options: formOptions } = normaliseFormulateParams(
        schemaOrKey,
        schemaOrRefOrOptions,
        refOrOptions,
        options
    );
    
    const { key, defaults, defaultValueOptions, schemas } = formOptions;
    
    type FormState = InferSchemaType<TSchema>;
    
    const mergedInitialValues = createInitialState(
        schema, 
        externalRef, 
        defaults, 
        defaultValueOptions
    );

    const initialStateSnapshot = ref<InferSchemaType<TSchema>>(structuredClone(mergedInitialValues));


    // -- State handling
    let state: Ref<FormState>;

    // External ref provided - use directly
    if (externalRef) {
        
        if (Object.keys(externalRef.value || {}).length === 0) {
            externalRef.value = mergedInitialValues as FormState;
        }
        state = externalRef;
    }
    // Key provided - use useState 
    else if (key) {
        
        state = useState<FormState>(key, () => mergedInitialValues as FormState);
    } 
    // No key, no external ref - use local ref
    else {
        state = ref(mergedInitialValues) as Ref<FormState>;
    }
    
    // -- Error / Partial handling
    const mergedPartialSchema = schemas?.partial || createPartialFromSchema(schema);

    const errorState = ref<ErrorStateType<InferSchemaType<TSchema>> | undefined>(undefined)

    function handlePartialValidation(
        partialSchema: SchemaType | Partial<InferSchemaType<TSchema>>,
        state: InferSchemaType<TSchema>
    ) {
        try {
            const validatedData = handleValidate(partialSchema, state);
            errorState.value = undefined;

            return validatedData;
        }
        catch (error) {
            errorState.value = error;
            throw error;
        }
    }

    // const debouncedHandlePartialValidation = debounce((
    //     partialSchema: SchemaType | Partial<InferSchemaType<TSchema>>,
    //     state: InferSchemaType<TSchema>
    // ) => {
       
    // }, 1500);


    // -- Field metadata handling
    const metaState = ref(createMetaState<TSchema>(schema, defaultValueOptions));
    
    watch(state, (newValue) => {
        syncArraysWithMetaState(metaState.value, newValue, initialStateSnapshot as Ref<InferSchemaType<TSchema>>, schema, defaultValueOptions);

        updateAllDirtyStates(metaState, newValue, initialStateSnapshot);

        try {
            handlePartialValidation(mergedPartialSchema, newValue);
            updateValidationStates(metaState.value, true, undefined);
        }
        catch (error) {
            updateValidationStates(metaState.value, false, errorState.value);
        }  

        // debouncedHandlePartialValidation(mergedPartialSchema, state.value);
    }, { deep: true });


    return {
        state,
        meta: metaState as Ref<MetaStateType<InferSchemaType<TSchema>>>,
        error: errorState as Ref<ErrorStateType<InferSchemaType<TSchema>> | undefined>,
    };
}