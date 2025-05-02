import * as z from 'zod';

import { debounce } from '~/utils/debounce';

import { createDefaultValuesFromZodSchema } from '../utils/validator/default';
import { createPartialSchema } from '../utils/validator/partial';
import { restructureZodErrors } from '~/utils/validator/flatten';



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


type InferZodType<T extends z.ZodType> = z.infer<T>;

type ErrorsFromSchema<T> = {
    [K in keyof T]?: T[K] extends object ? ErrorsFromSchema<T[K]> : string;
};

/**
 * Options for the useFormulate hook
 */
type FormulateOptions<TSchema extends z.ZodType> = {
    /**
     * Initial state values to override defaults
     */
    defaults?: Partial<InferZodType<TSchema>>;
   
    /**
     * A partial schema to use for validation during form editing
     * If not provided, one will be created automatically
     */
    partialSchema?: z.ZodType;
   
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
  

export function useFormulate<TSchema extends z.ZodType>(
    schemaOrKey: string | TSchema,
    schemaOrRefOrOptions?: TSchema | Ref<InferZodType<TSchema> | undefined | null> | FormulateOptions<TSchema>,
    refOrOptions?: Ref<InferZodType<TSchema>> | FormulateOptions<TSchema>,
    options?: FormulateOptions<TSchema>
  ) {
    let schema: TSchema;
    let externalRef: Ref<InferZodType<TSchema>> | undefined;
    let formOptions: FormulateOptions<TSchema> = {};
    
    // Function arguments are flexible for convenience
    if (typeof schemaOrKey === 'string') {
        const dataKey = schemaOrKey;
        schema = schemaOrRefOrOptions as TSchema;
        
        if (refOrOptions && 'value' in refOrOptions) {
            externalRef = refOrOptions as Ref<InferZodType<TSchema>>;
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
            externalRef = schemaOrRefOrOptions as Ref<InferZodType<TSchema>>;
            formOptions = refOrOptions as FormulateOptions<TSchema> || {};
        }
        else {
            formOptions = schemaOrRefOrOptions as FormulateOptions<TSchema> || {};
        }
    }
    
    const {
        defaults = {},
        partialSchema,
        validationDebounce = 350,
        key
    } = formOptions;
    
    if (
        schema instanceof z.core.$ZodObject &&
        !(schema instanceof z.core.$ZodInterface) &&
        !(schema instanceof z.core.$ZodArray)
    ) {
        console.warn('⚠️ useFormulate works best with z.interface() instead of z.object() for better performance and type safety.');
    }
    
    // Infer state and errors shape via schema
    type FormState = InferZodType<TSchema>;
    type FormErrors = ErrorsFromSchema<FormState>;
    
    // @ts-ignore
    const defaultValues = createDefaultValuesFromZodSchema(schema);
    const mergedInitialValues = { ...defaultValues, ...defaults };
    
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
        state = ref<FormState>(mergedInitialValues as FormState);
    }
    
    const errors = ref<FormErrors>({});
    const validationSchema = partialSchema || createPartialSchema(schema);
    const debouncedValidateState = debounce(validateState, validationDebounce);
    
    watch(() => state.value, () => {
        debouncedValidateState();
    }, { deep: true });
    
    function validateState() {
        try {
            validationSchema.parse(state.value);
            errors.value = {};
            return null;
        }
        catch (error) {
            if (error instanceof z.ZodError) {
                const tree = z.treeifyError(error);
                const flattenedErrors = restructureZodErrors(tree);
                errors.value = flattenedErrors;
                return error;
            }
            return null;
        }
    }
    
    return {
        state,
        errors
    };
}