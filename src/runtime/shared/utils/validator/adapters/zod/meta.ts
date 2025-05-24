import * as z from 'zod/v4/core'

import type { DefaultValueGenerationOptions } from "../../../../types/defaults";



/**
 * Creates a meta state object that mirrors the structure of the form state
 * but contains metadata about each field instead of values
 */
export function createMetaState(
    schema: z.$ZodAny,
    options?: DefaultValueGenerationOptions,
    currentDepth: number = 0
): Record<string, any> {
    const defaultFieldMeta = {
        isDirty$: false,
        isValid$: false,
    };

    let schemaType: string = 'unknown';
    if (schema._zod && schema._zod.def) {
        schemaType = schema._zod.def.type;
    }
    // @ts-expect-error
    else if (schema.type) {
        console.error('Schema type is not defined');
        //@ts-expect-error
        schemaType = schema.type;
    }

    if (schemaType === 'object') {
        return handleObjectMetaState(schema, defaultFieldMeta, options, currentDepth);
    }
    
    if (schemaType === 'array') {
        return handleArrayMetaState(schema, defaultFieldMeta, options, currentDepth);
    }

    return defaultFieldMeta;
}




/**
 * Handles meta state generation for object-like schemas
 */
function handleObjectMetaState(
    schema: any, 
    defaultFieldMeta: any,
    options?: DefaultValueGenerationOptions,
    currentDepth: number = 0
): Record<string, any> {
    const result: Record<string, any> = { 
        ...defaultFieldMeta,
    };
    
    if (schema._zod && schema._zod.def && schema._zod.def.shape) {
        const shape = schema._zod.def.shape;
        
        for (const key in shape) {
            result[key] = createMetaState(shape[key], options, currentDepth + 1);
        }
    }
    
    return result;
}

/**
 * Handles meta state generation for array schemas
 */
export function handleArrayMetaState(
    schema: any,
    defaultFieldMeta: any,
    options: any,
    currentDepth = 0
) {
    const arrayMeta = {
        ...defaultFieldMeta,
        items: []
    };
    
    if (!schema._zod?.def?.element) {
        throw new Error('⚠️ Zod array schema is missing _zod or _zod.def. Are you sure this is a Zod schema?');
    }
    
    const elementSchema = schema._zod.def.element;
    const arrayOptions = options?.arrays;
    
    let initialItemCount = 0;
    
    if (arrayOptions === undefined || arrayOptions === 'empty') {
        initialItemCount = 0;
    }
    else if (arrayOptions === 'populate') {
        initialItemCount = 1;
    }
    else if (typeof arrayOptions === 'object' && arrayOptions !== null) {
        const depthConfig = 'depth' in arrayOptions ? arrayOptions.depth : undefined;
        
        if (depthConfig) {
            const fallback = depthConfig.fallback || 'empty';
            let shouldUseFallback = false;
            
            if (depthConfig.max !== undefined) {
                shouldUseFallback = currentDepth >= depthConfig.max;
            } else if (depthConfig.layers !== undefined && depthConfig.layers.length > 0) {
                shouldUseFallback = !depthConfig.layers.includes(currentDepth);
            }
            
            if (shouldUseFallback) {
                if (fallback === 'empty') return arrayMeta;
                return arrayMeta;
            }
        }
        
        initialItemCount = arrayOptions.length !== undefined ? arrayOptions.length : 1;
    }
    
    for (let i = 0; i < initialItemCount; i++) {
        arrayMeta.items.push(createMetaState(elementSchema, options, currentDepth + 1));
    }
    
    return arrayMeta;
}

/**
 * Synchronizes metastate   form state for arrays
 * Called when form state changes to ensure metastate structure matches
 */
export function syncArraysWithMetaState(
    metaState: any,
    formState: any,
    schema: any,
    options: any
) {
    if (!metaState || !formState) return;
    
    if (schema._zod?.def?.type === 'object' && schema._zod?.def?.shape) {
        const shape = schema._zod.def.shape;
        
        for (const key in shape) {
            if (key in formState) {
                const propertyValue = formState[key];
                const propertySchema = shape[key];
                
                if (!(key in metaState)) {
                    metaState[key] = createMetaState(propertySchema, options);
                }
                
                // Recursively process arrays or objects
                if (Array.isArray(propertyValue)) {
                    syncArrayMetaState(metaState[key], propertyValue, propertySchema, options);
                }
                else if (propertyValue && typeof propertyValue === 'object') {
                    syncArraysWithMetaState(metaState[key], propertyValue, propertySchema, options);
                }
            }
        }
    }
    else if (schema._zod?.def?.type === 'array' && Array.isArray(formState)) {
        syncArrayMetaState(metaState, formState, schema, options);
    }
}

/**
 * Specifically handles synchronizing array items in metastate
 */
function syncArrayMetaState(
    arrayMetaState: any,
    arrayFormState: any,
    arraySchema: any,
    options: any
) {
    if (!arrayMetaState.items) {
        arrayMetaState.items = [];
    }
    
    const elementSchema = arraySchema._zod?.def?.element;
    if (!elementSchema) return;
    
    // Add missing metastate items
    if (arrayMetaState.items.length < arrayFormState.length) {
        for (let i = arrayMetaState.items.length; i < arrayFormState.length; i++) {
            arrayMetaState.items[i] = createMetaState(elementSchema, options);
        }
    }
    // Remove extra items
    else if (arrayMetaState.items.length > arrayFormState.length) {
        arrayMetaState.items.splice(arrayFormState.length);
    }
    
    for (let i = 0; i < arrayFormState.length; i++) {
        const itemValue = arrayFormState[i];
        
        if (itemValue && typeof itemValue === 'object') {
            syncArraysWithMetaState(arrayMetaState.items[i], itemValue, elementSchema, options);
        }
    }
}