import * as z from "@zod/core"

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
        console.log('Array schema detected');
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
function handleArrayMetaState(
    schema: any,
    defaultFieldMeta: any,
    options?: DefaultValueGenerationOptions,
    currentDepth: number = 0
): any {
    const arrayMeta = {
        ...defaultFieldMeta,
        items: [] as any[]
    };

    const elementSchema = schema._zod.def.element;

    const arrayOptions = options?.arrays

    if (arrayOptions === undefined || typeof arrayOptions === 'string') {
        if (!elementSchema) {
            throw new Error('⚠️ Zod array schema is missing _zod or _zod.def. Are you sure this is a Zod schema? If so please create an issue on Formulate\'s GitHub.');
        }

        arrayMeta.items.push(createMetaState(elementSchema, options, currentDepth + 1));
        return arrayMeta;
    }

    else if (typeof arrayOptions === 'object') {
        const length = arrayOptions.length !== undefined ? arrayOptions.length : 1;
        
        for (let i = 0; i < length; i++) {
            arrayMeta.items.push(createMetaState(elementSchema, options, currentDepth + 1));
        }

        return arrayMeta;
    }
    
    throw new Error('⚠️ Zod array schema is missing _zod or _zod.def. Are you sure this is a Zod schema? If so please create an issue on Formulate\'s GitHub.');
}




















// if (typeof arrays === 'object' && arrays !== null && 'method' in arrays && 
//     arrays.method === 'populate' && arrays.length !== undefined) {
//     console.log('Populating array with sensible defaults');
//     const elementSchema = schema._zod && schema._zod.def && schema._zod.def.element;
    
//     if (elementSchema) {
//         for (let i = 0; i < arrays.length; i++) {
//             arrayMeta.items.push(createMetaState(elementSchema, options, currentDepth + 1));
//         }
//     }
// }