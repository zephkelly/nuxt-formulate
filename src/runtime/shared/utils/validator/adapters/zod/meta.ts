import * as z from "@zod/core"

import type { DefaultValueGenerationOptions } from "../../../../types/defaults";
import type { SchemaType } from "../../../../types/schema";


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
        isDirty: false,
        isValid: true,
        validating: false,
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

    if (schemaType === 'interface' || schemaType === 'object') {
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
    
    const { arrays = 'empty' } = options || {};
    
    if (typeof arrays === 'object' && arrays !== null && 'method' in arrays && 
        arrays.method === 'populate' && arrays.length !== undefined) {
        
        const elementSchema = schema._zod && schema._zod.def && schema._zod.def.element;
        
        if (elementSchema) {
            for (let i = 0; i < arrays.length; i++) {
                arrayMeta.items.push(createMetaState(elementSchema, options, currentDepth + 1));
            }
        }
    }
    
    return arrayMeta;
}