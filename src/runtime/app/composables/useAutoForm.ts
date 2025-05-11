
import { type Ref, ref, watch } from 'vue';
import { useState } from 'nuxt/app';

import type { SchemaType, InferSchemaType } from '../../shared/types/schema';

import { mergeWithGlobalOptions } from '../../shared/utils/options';
import { createDefaultValues, createPartialSchema, createMetaState, handleValidate } from '../../shared/utils/validator';
import type { DefaultValueGenerationOptions } from '../../shared/types/defaults';
import type { FieldMeta } from '../../shared/types/meta';

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
     * Used when the function is called with a string as the first argument
     */
    key?: string;

    /**
     * Initial state values to override defaults
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
    
    const {
        key,
        defaults,
        defaultValueOptions,
        schemas,
    } = formOptions;
    
    type FormState = InferSchemaType<TSchema>;
    
    const mergedInitialValues = createInitialState(
        schema, 
        externalRef, 
        defaults, 
        defaultValueOptions
    );

    // Create a deep copy of initial values to compare against for dirty checking
    const initialStateSnapshot = JSON.parse(JSON.stringify(mergedInitialValues));

    // Generate flattened paths for all nested fields
    const allFieldPaths = getAllNestedPaths(mergedInitialValues);
    
    // Initialize metaState with proper structure
    const metaState = ref({} as Record<string, FieldMeta>);
    
    // Initialize meta fields for all nested paths
    initializeMetaFields(metaState.value, allFieldPaths);

    // -- State handling with Proxy wrapping
    let state: Ref<FormState>;
    
    // Helper function to create a proxy that tracks changes
    function createTrackingProxy(target: any, path = ''): any {
        if (target === null || typeof target !== 'object') {
            return target;
        }
        
        return new Proxy(target, {
            get(obj, prop) {
                if (typeof prop === 'symbol') return obj[prop];
                
                const value = obj[prop];
                const newPath = path ? `${path}.${prop}` : `${prop}`;
                
                if (value !== null && typeof value === 'object') {
                    return createTrackingProxy(value, newPath);
                }
                
                return value;
            },
            set(obj, prop, value) {
                if (typeof prop === 'symbol') {
                    obj[prop] = value;
                    return true;
                }
                
                const newPath = path ? `${path}.${prop}` : `${prop}`;
                const oldValue = obj[prop];
                
                // Set the new value
                obj[prop] = value;
                
                // Check if the value has changed
                const isDirty = !isDeepEqual(value, getValueByPath(initialStateSnapshot, newPath));
                
                // Mark field as dirty if changed
                updateMetaStateField(metaState.value, newPath, 'isDirty', isDirty);
                
                return true;
            }
        });
    }
    
    // External ref provided - wrap it with proxy
    if (externalRef) {
        if (Object.keys(externalRef.value || {}).length === 0) {
            externalRef.value = createTrackingProxy(mergedInitialValues) as FormState;
        } else {
            externalRef.value = createTrackingProxy(externalRef.value) as FormState;
        }
        
        state = externalRef;
    } 
    // Key provided - use useState with proxy
    else if (key) {
        const stateValue = useState<FormState>(key, () => mergedInitialValues as FormState);
        stateValue.value = createTrackingProxy(stateValue.value) as FormState;
        state = stateValue;
    } 
    // No key, no external ref - use local ref with proxy
    else {
        state = ref(createTrackingProxy(mergedInitialValues)) as Ref<FormState>;
    }

    // -- Partial schema handling
    const mergedPartialSchema = schemas?.partial || createPartialFromSchema(schema);

    // Watch for validation changes
    watch(state, (newValue) => {
        const validationResult = handleValidate(mergedPartialSchema, newValue);
        // Update validation results in metaState
        updateMetaStateValidation(metaState.value, validationResult);
    }, { deep: true });

    // Helper function to get all nested paths in an object
    function getAllNestedPaths(obj: any, path = '', result: string[] = []): string[] {
        if (obj === null || typeof obj !== 'object') {
            result.push(path);
            return result;
        }
        
        // Add the current path if it's not empty
        if (path) result.push(path);
        
        for (const key in obj) {
            const newPath = path ? `${path}.${key}` : key;
            if (obj[key] !== null && typeof obj[key] === 'object') {
                getAllNestedPaths(obj[key], newPath, result);
            } else {
                result.push(newPath);
            }
        }
        
        return result;
    }

    // Initialize meta fields for all discovered paths
    function initializeMetaFields(meta: Record<string, FieldMeta>, paths: string[]) {
        paths.forEach(path => {
            if (!meta[path]) {
                meta[path] = {
                    isDirty: false,
                    isTouched: false,
                    isValid: true,
                    validating: false
                };
            }
        });
    }

    // Deep equality check
    function isDeepEqual(a: any, b: any): boolean {
        if (a === b) return true;
        
        if (a === null || b === null || 
            typeof a !== 'object' || typeof b !== 'object') {
            return a === b;
        }
        
        if (Array.isArray(a) && Array.isArray(b)) {
            if (a.length !== b.length) return false;
            return a.every((item, index) => isDeepEqual(item, b[index]));
        }
        
        const keysA = Object.keys(a);
        const keysB = Object.keys(b);
        
        if (keysA.length !== keysB.length) return false;
        
        return keysA.every(key => isDeepEqual(a[key], b[key]));
    }

    // Helper to get a value by path
    function getValueByPath(obj: any, path: string): any {
        if (!path) return obj;
        return path.split('.').reduce((prev, curr) => 
            prev && prev[curr] !== undefined ? prev[curr] : undefined, obj);
    }

    // Update meta state field
    function updateMetaStateField(
        meta: Record<string, FieldMeta>, 
        path: string, 
        property: keyof FieldMeta, 
        value: boolean
    ) {
        if (!meta[path]) {
            meta[path] = {
                isDirty: false,
                isTouched: false,
                isValid: true,
                validating: false
            };
        }
        
        meta[path][property] = value;
        
        // Update parent paths dirty status
        if (property === 'isDirty' && value === true) {
            updateParentPathsDirty(meta, path);
        }
    }
    
    // Update parent paths as dirty when child is dirty
    function updateParentPathsDirty(meta: Record<string, FieldMeta>, path: string) {
        const parts = path.split('.');
        
        // Update each parent path
        while (parts.length > 1) {
            parts.pop();
            const parentPath = parts.join('.');
            
            if (parentPath && meta[parentPath]) {
                meta[parentPath].isDirty = true;
            }
        }
    }
    
    // Implement validation update based on your validation result format
    function updateMetaStateValidation(meta: Record<string, FieldMeta>, validationResult: any) {
        // Implementation depends on your validation result format
        if (!validationResult) return;
        
        // Example implementation
        if (validationResult.errors) {
            //@ts-expect-error
            Object.entries(validationResult.errors).forEach(([path, errors]: [string, any[]]) => {
                if (!meta[path]) {
                    meta[path] = {
                        isDirty: false,
                        isTouched: false,
                        isValid: true,
                        validating: false
                    };
                }
                
                meta[path].isValid = errors.length === 0;
                meta[path].validating = false;
            });
        }
    }

    return {
        state,
        meta: metaState,
        // Utility methods
        markTouched: (path: string) => updateMetaStateField(metaState.value, path, 'isTouched', true),
        markValidating: (path: string, isValidating: boolean = true) => 
            updateMetaStateField(metaState.value, path, 'validating', isValidating),
        resetToDefault: () => {
            // Create a new proxy with initial values
            const resetValues = createTrackingProxy(
                JSON.parse(JSON.stringify(initialStateSnapshot))
            ) as FormState;
            
            // Assign to state
            state.value = resetValues;
            
            // Reset meta state
            Object.keys(metaState.value).forEach(path => {
                if (metaState.value[path]) {
                    metaState.value[path].isDirty = false;
                    metaState.value[path].isTouched = false;
                    metaState.value[path].validating = false;
                }
            });
        },
        // Get flattened list of all field paths
        getFieldPaths: () => allFieldPaths
    };
}