import * as z from 'zod';

import { debounce } from '~/utils/debounce';

import { createDefaultValuesFromZodSchema } from '../utils/validator/default';
import { createPartialSchema } from '../utils/validator/partial';
import { restructureZodErrors } from '~/utils/validator/flatten';

//////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
////////                                                               ////////
////////                      **  FORMULATE  **                        ////////
////////            The simple form and validation library             ////////
////////                                                               ////////
///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////


// Infer the type of the Zod schema to strictly type the state
type InferZodType<T extends z.ZodType> = z.infer<T>;

// Type for the errors returned from the Zod schema that matches
// the structure of the state
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
};
  

export function useFormulate<TSchema extends z.ZodType>(
  schema: TSchema,
  options: FormulateOptions<TSchema> = {}
) {
    const {
        defaults = {},
        partialSchema,
        validationDebounce = 350
    } = options;

    if (
        schema instanceof z.core.$ZodObject && 
        !(schema instanceof z.core.$ZodInterface) && 
        !(schema instanceof z.core.$ZodArray)
    ) {
        console.warn('⚠️ useFormulate works best with z.interface() instead of z.object() for better performance and type safety.');
    }

    type FormState = InferZodType<TSchema>;
    type FormErrors = ErrorsFromSchema<FormState>;

    const defaultValues = createDefaultValuesFromZodSchema(schema);
  
    // Merge default values with any provided initialValues
    const mergedInitialValues = { ...defaultValues, ...defaults };

    const state = ref<FormState>(mergedInitialValues as FormState);
    const errors = ref<FormErrors>({});

    const validationSchema = partialSchema || createPartialSchema(schema);

    const debouncedValidateState = debounce(validateState, validationDebounce);

    watch(() => state, () => {
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