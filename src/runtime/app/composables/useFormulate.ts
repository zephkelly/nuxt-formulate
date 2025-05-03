
import { type Ref, ref, watch } from 'vue';
import { useState } from 'nuxt/app';

import type { SchemaType, InferSchemaType, ErrorsFromSchema } from './../../shared/types/schema';

import {
    createDefaultValues,
    // createPartialSchema,
    // handleValidationErrors
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
    schema: TSchema
): { state: Ref<InferSchemaType<TSchema>>, errors: Ref<ErrorsFromSchema<InferSchemaType<TSchema>>> };
  
// useFormulate(validationSchema, refToSyncDataTo)
export function useFormulate<TSchema extends SchemaType>(
    schema: TSchema,
    ref: Ref<InferSchemaType<TSchema> | undefined | null>
): { state: Ref<InferSchemaType<TSchema>>, errors: Ref<ErrorsFromSchema<InferSchemaType<TSchema>>> };
  
// useFormulate(validationSchema, options)
export function useFormulate<TSchema extends SchemaType>(
    schema: TSchema,
    options: FormulateOptions<TSchema>
): { state: Ref<InferSchemaType<TSchema>>, errors: Ref<ErrorsFromSchema<InferSchemaType<TSchema>>> };
  
// useFormulate('key', validationSchema)
export function useFormulate<TSchema extends SchemaType>(
    key: string,
    schema: TSchema
): { state: Ref<InferSchemaType<TSchema>>, errors: Ref<ErrorsFromSchema<InferSchemaType<TSchema>>> };
  
// useFormulate('key', validationSchema, options)
export function useFormulate<TSchema extends SchemaType>(
    key: string,
    schema: TSchema,
    options: FormulateOptions<TSchema>
): { state: Ref<InferSchemaType<TSchema>>, errors: Ref<ErrorsFromSchema<InferSchemaType<TSchema>>> };
  
// useFormulate('key', validationSchema, refToSyncDataWith, options)
export function useFormulate<TSchema extends SchemaType>(
    key: string,
    schema: TSchema,
    ref: Ref<InferSchemaType<TSchema> | undefined | null>,
    options: FormulateOptions<TSchema>
): { state: Ref<InferSchemaType<TSchema>>, errors: Ref<ErrorsFromSchema<InferSchemaType<TSchema>>> };
  
  
// useFormulate(refToModelStateAndSyncDataWith, options)
export function useFormulate<TSchema extends SchemaType>(
    ref: Ref<InferSchemaType<TSchema> | undefined | null>,
    options?: FormulateOptions<TSchema>
): { state: Ref<InferSchemaType<TSchema>>, errors: Ref<ErrorsFromSchema<InferSchemaType<TSchema>>> };
  
export function useFormulate<TSchema extends SchemaType>(
    schemaOrKeyOrRef: string | TSchema | Ref<InferSchemaType<TSchema> | undefined | null>,
    schemaOrOptionsOrRef?: TSchema | Ref<InferSchemaType<TSchema> | undefined | null> | FormulateOptions<TSchema>,
    optionsOrRef?: Ref<InferSchemaType<TSchema> | undefined | null> | FormulateOptions<TSchema>,
    options?: FormulateOptions<TSchema>
): { 
    state: Ref<InferSchemaType<TSchema>>, 
    errors: Ref<ErrorsFromSchema<InferSchemaType<TSchema>>> 
} {
    validateApiUsage(schemaOrKeyOrRef, schemaOrOptionsOrRef, optionsOrRef, options);

    let schema: TSchema | undefined;
    let externalRef: Ref<InferSchemaType<TSchema>> | undefined;
    let formOptions: FormulateOptions<TSchema> = {};
    
    if (typeof schemaOrKeyOrRef === 'string') {
        const dataKey = schemaOrKeyOrRef;
        schema = schemaOrOptionsOrRef as TSchema;
        
        if (optionsOrRef && 'value' in optionsOrRef) {
          externalRef = optionsOrRef as Ref<InferSchemaType<TSchema>>;
          formOptions = options || {};
        } else {
          formOptions = optionsOrRef as FormulateOptions<TSchema> || {};
        }
        
        formOptions.key = dataKey;
      }
      // Case 2: First parameter is a Ref (form state model)
      else if (schemaOrKeyOrRef && typeof schemaOrKeyOrRef === 'object' && 'value' in schemaOrKeyOrRef) {
        externalRef = schemaOrKeyOrRef as Ref<InferSchemaType<TSchema>>;
        
        // Check if second parameter is options or schema
        if (schemaOrOptionsOrRef && typeof schemaOrOptionsOrRef === 'object') {
          if ('value' in schemaOrOptionsOrRef) {
            // This doesn't make sense - we already have a ref as first param
            // Just ignore this parameter
          } else {
            // Second parameter is either options or schema
            // We'll treat it as options since we already have the state ref
            formOptions = schemaOrOptionsOrRef as FormulateOptions<TSchema>;
          }
        }
        
      }
      // Case 3: First parameter is a regular schema object
      else {
        schema = schemaOrKeyOrRef as TSchema;
        
        if (schemaOrOptionsOrRef && 'value' in schemaOrOptionsOrRef) {
          externalRef = schemaOrOptionsOrRef as Ref<InferSchemaType<TSchema>>;
          formOptions = optionsOrRef as FormulateOptions<TSchema> || {};
        } else {
          formOptions = schemaOrOptionsOrRef as FormulateOptions<TSchema> || {};
        }
      }
    
    const {
        defaults = {},
        // partialSchema,
        // validationDebounce = 350,
        key
    } = formOptions;
    
    type FormState = InferSchemaType<TSchema>;
    type FormErrors = ErrorsFromSchema<FormState>;
    
    let defaultValues: FormState;
    if (schema) {
        defaultValues = createDefaultValues<FormState>(schema);
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
        state = ref(mergedInitialValues) as Ref<FormState>;
    }
    
    const errors = ref<FormErrors>({});

    // const validationSchema = partialSchema || createPartialSchema(schema);
    
    // watch(() => state.value, () => {
    //    debouncedValidateState();
    // }, { deep: true });
    
    return {
        state,
        errors
    };
}




/**
 * Validates the API usage patterns and throws errors for invalid combinations
 */
function validateApiUsage<TSchema extends SchemaType>(
    arg1: string | TSchema | Ref<InferSchemaType<TSchema> | undefined | null>,
    arg2?: TSchema | Ref<InferSchemaType<TSchema> | undefined | null> | FormulateOptions<TSchema>,
    arg3?: Ref<InferSchemaType<TSchema> | undefined | null> | FormulateOptions<TSchema>,
    arg4?: FormulateOptions<TSchema>
) {
    const isString = typeof arg1 === 'string';
    const isRef = arg1 && typeof arg1 === 'object' && 'value' in arg1;
   
    if (isRef) {
        if (arg3 !== undefined || arg4 !== undefined) {
            throw new Error('Invalid API usage: When providing a ref as first argument, only options object can be provided as second argument');
        }
        
        if (arg2 && typeof arg2 === 'object' && 'value' in arg2) {
            throw new Error('Invalid API usage: When providing a ref as first argument, second argument cannot be a ref');
        }
        
        return;
    }
    
    if (isString) {
        if (!arg2) {
            throw new Error('Invalid API usage: When using a string key as first argument, validation schema must be provided as second argument');
        }
        
        if (typeof arg2 === 'object' && ('value' in arg2 || 'defaults' in arg2 || 'key' in arg2)) {
            throw new Error('Invalid API usage: When using a string key as first argument, second argument must be a validation schema');
        }
        
        if (arg3) {
            const isArg3Ref = typeof arg3 === 'object' && 'value' in arg3;
            
            if (isArg3Ref && !arg4) {
                throw new Error('Invalid API usage: When providing a ref as third argument with a key pattern, options must be provided as fourth argument');
            }
            
            if (!isArg3Ref && arg4) {
                throw new Error('Invalid API usage: Too many arguments provided');
            }
        }
        
        return;
    }
    
    if (arg3 !== undefined || arg4 !== undefined) {
        throw new Error('Invalid API usage: When providing a schema as first argument, only one additional argument is allowed (ref or options)');
    }
    
    return;
}