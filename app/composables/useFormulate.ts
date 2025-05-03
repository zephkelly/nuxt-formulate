import * as z from 'zod';

import type { SchemaType, InferSchemaType, ErrorsFromSchema } from '~/shared/types/schema';


import { debounce } from '~/shared/utils/debounce';

import { createDefaultValues } from '~/shared/utils/validator/default';
import { createPartialSchema } from '~/shared/utils/validator/partial';

import { handleValidationErrors } from '~/shared/utils/validator/error';



 ///////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////                                                                ////////
////////                       **  FORMULATE  **                        ////////
////////       The simple form management and validation library        ////////
////////                                                                ////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////



// Define a union type that can be either a ZodType or a StandardSchema


// Updated ErrorsFromSchema type


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
    partialSchema?: TSchema extends z.ZodType ? z.ZodType : TSchema;
    
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
    
    // Function arguments are flexible for convenience
    if (typeof schemaOrKey === 'string') {
        const dataKey = schemaOrKey;
        schema = schemaOrRefOrOptions as TSchema;
        
        if (refOrOptions && 'value' in refOrOptions) {
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
        
        if (schemaOrRefOrOptions && 'value' in schemaOrRefOrOptions) {
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
        validationDebounce = 350,
        key
    } = formOptions;
    
    // Infer state and errors shape via schema
    type FormState = InferSchemaType<TSchema>;
    type FormErrors = ErrorsFromSchema<FormState>;
    
    const defaultValues = createDefaultValues<FormState>(schema);
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
        
        // Provide two way data binding with external useState ref/key
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
        //@ts-expect-error
        state = ref(mergedInitialValues) as Ref<FormState>;
    }
    
    //@ts-ignore
    const errors = ref<FormErrors>({});
    const validationSchema = partialSchema || createPartialSchema(schema);
    const debouncedValidateState = debounce(validateState, validationDebounce);
    
    watch(() => state.value, () => {
        debouncedValidateState();
    }, { deep: true });
    
    async function validateState() {
        try {
            // Handle StandardSchema
            if (isStandardSchema(validationSchema)) {
                const result = validationSchema['~standard'].validate(state.value);
                const finalResult = result instanceof Promise ? await result : result;
                
                if (finalResult.issues) {
                errors.value = handleValidationErrors({ issues: finalResult.issues }) as FormErrors;
                return { issues: finalResult.issues };
                }
                
                errors.value = {};
                return null;
            } 

            // Handle Zod schema
            else if (validationSchema instanceof z.ZodType) {
                validationSchema.parse(state.value);
                errors.value = {};
                return null;
            } 
            
            // Handle unknown schema
            else {
                console.warn('Unknown schema type');
                errors.value = {};
                return null;
            }
        }
        catch (error) {
            errors.value = handleValidationErrors(error) as FormErrors;
            return error;
        }
    }
    
    return {
        state,
        errors
    };
}