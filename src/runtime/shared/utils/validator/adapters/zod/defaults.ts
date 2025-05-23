import * as z from 'zod/v4/core';

import type { DefaultValueGenerationOptions } from "../../../../types/defaults";



/**
 * Recursively populates default undefined values for a given Zod schema,
 * but breaking all schemas down to their base types.
 * 
 * @param schema The Zod schema to create default values for
 * @returns An object   default values for the schema
 */
export function createZodSchemaDefaultValues(
    schema: z.$ZodType,
    options?: DefaultValueGenerationOptions,
    currentDepth: number = 0
): any {
    let schemaType: z.$ZodTypeDef['type'] = 'unknown';
    if (schema._zod && schema._zod.def) {
        schemaType = schema._zod.def.type;
    }
    //@ts-expect-error
    else if (schema.type) {
        // @ts-expect-error
        schemaType = schema.type;
    }
    

    if (schemaType === 'object') {
        //@ts-ignore - We know the type is an interface
        return handleZodObject(schema, options, currentDepth);
    }
    
    if (schemaType === 'array') {
        //@ts-ignore - We know the type is an array
        return handleZodArray(schema as z.$ZodArray, options, currentDepth);
    }
    

    // -- Will handle other Zod types here --


    return createZodTypeSchemaDefaultValue(schema, options);
}



// -----------------------------------------------------------------------------
// Helper functions
// -----------------------------------------------------------------------------

// ZodType
function createZodTypeSchemaDefaultValue(schema: z.$ZodType, options?: DefaultValueGenerationOptions): any {
    const { primitives = 'sensible' } = options || {};

    if (primitives === 'undefined') {
        return undefined;
    }
    else if (primitives === 'null') {
        return null;
    }
    else if (primitives === 'sensible') {
        if (!schema._zod) return undefined;
    
    
        // If the user defined a default for this field, use it
        if (schema._zod.def &&
            //@ts-ignore
            schema._zod.def.defaultValue
        ) {
            // @ts-ignore
            return schema._zod.def.defaultValue();
        }
    
    
        // If the field is a primitive type with only one valid
        // value, use that value
        if (schema._zod.values &&
            schema._zod.values.size === 1
        ) {
            const primitiveValue = schema._zod.values.values().next().value;
            return primitiveValue;
        }

        return createZodTypeSensibleDefaultValue(schema._zod.def)
    }


    
    

    return undefined;
}

function createZodTypeSensibleDefaultValue(fieldDefinition: z.$ZodTypeDef): any {
    switch (fieldDefinition.type) {
        case 'string':
            return '';
        case 'number':
            return 0;
        case 'int':
            return 0;
        case 'bigint':
            return BigInt(0);
        case 'boolean':
            return false;
        case 'date':
            return new Date();
        case 'null':
            return null;
        case 'array':
            return [];
        case 'tuple':
            return [undefined, undefined];
        case 'map':
            return new Map();
        case 'set':
            return new Set();
        case 'undefined':
            return undefined;
        case 'void':
            return undefined;
        case 'any':
            return undefined;
        case 'unknown':
            return undefined;
        case 'never':
            return undefined;
        case 'symbol':
            return Symbol();
        case 'object':
            undefined;
        case 'record':
            return {};
        case 'file':
            return undefined;
        case 'enum':
            return undefined;
        case 'nan':
            return undefined;
        case 'optional':
            return undefined;
        case 'nullable':
            return null;
        case 'template_literal':
            return '';
        case 'catch':
            return undefined;
        case 'custom':
            return undefined;
        case 'lazy':
            return undefined;
        case 'readonly':
            return undefined;
        case 'promise':
            return undefined;
        case 'success':
            return undefined;
        case 'nonoptional':
            throw new Error('⚠️ Zod nonoptional does not support automatic default values. Please provide a .default() value for this field in your schema.');

        case 'interface':
            return undefined;
        case 'union':
            return undefined;
        case 'intersection':
            return undefined;
        case 'literal':
            return undefined;
        case 'transform':
            return undefined;
        case 'default':
            return undefined;
        case 'pipe':
            return undefined;
        case 'prefault':
            return undefined;
        default:
            const exhaustiveCheck: never = fieldDefinition.type;
            throw new Error(`⚠️ Internal Formulate error: New unhandled Zod type: ${exhaustiveCheck}`);
        }
}



// $ZodArray
function handleZodArray(
    schema: z.$ZodArray, 
    options?: DefaultValueGenerationOptions,
    currentDepth: number = 0
): any {
    const { arrays = 'empty' } = options || {};

    const depthConfig = typeof arrays === 'object' && arrays !== null && 'depth' in arrays 
        ? arrays.depth 
        : undefined;
    
    if (depthConfig) {
        const fallback = depthConfig.fallback || 'empty';
        let shouldUseFallback = false;
        
        if (depthConfig.max !== undefined) {
            shouldUseFallback = currentDepth >= depthConfig.max;
        }
        else if (depthConfig.layers !== undefined && depthConfig.layers.length > 0) {
            shouldUseFallback = !depthConfig.layers.includes(currentDepth);
        }
        
        if (shouldUseFallback) {
            if (fallback === 'empty') return [];
            if (fallback === 'undefined') return undefined;
            if (fallback === 'null') return null;
        }
    }
    
    if (typeof arrays === 'string') {
        if (arrays === 'empty') return [];
        if (arrays === 'undefined') return undefined;
        if (arrays === 'null') return null;
        if (arrays === 'populate') {
            return generateSensibleArrayItems(schema, options, 1, currentDepth + 1);
        }
    }
    
    if (typeof arrays === 'object' && arrays !== null && 'method' in arrays) {
        const method = arrays.method;
        const length = arrays.length !== undefined ? arrays.length : 1;
        
        if (method === 'undefined') {
            return Array(length).fill(undefined);
        }
        
        if (method === 'null') {
            return Array(length).fill(null);
        }
        
        if (method === 'empty') {
            return [];
        }
        
        if (method === 'populate') {
            return generateSensibleArrayItems(schema, options, length, currentDepth + 1);
        }
    }
    
    return [];
}

function generateSensibleArrayItems(
    schema: z.$ZodArray,
    options?: DefaultValueGenerationOptions,
    length: number = 1,
    currentDepth: number = 0
): any[] {
    const zodArray = schema as z.$ZodArray<any>;
    
    if (!zodArray._zod || !zodArray._zod.def ||
        !zodArray._zod.def.element || !zodArray._zod.def.element.def) {
        throw new Error('⚠️ Zod array schema is missing _zod or _zod.def. Are you sure this is a Zod schema? If so please create an issue on Formulate\'s GitHub.');
    }
    
    const internalZodArrayElementDefinition = zodArray._zod.def.element.def;
    const result: any[] = [];
    
    for (let i = 0; i < length; i++) {
        if (internalZodArrayElementDefinition.shape) {
            const arraySchemaShape = internalZodArrayElementDefinition.shape;
            const defaults: Record<string, any> = {};
            
            for (const key in arraySchemaShape) {
                defaults[key] = createZodSchemaDefaultValues(
                    arraySchemaShape[key], 
                    options, 
                    currentDepth
                );
            }
            
            result.push(defaults);
        }
        else if (internalZodArrayElementDefinition.type) {
            result.push(createZodSchemaDefaultValues(
                zodArray._zod.def.element, 
                options, 
                currentDepth
            ));
        }
        else {
            result.push(undefined);
        }
    }
    
    return result;
}


// $ZodObject
function handleZodObject(
    schema: z.$ZodObject,
    options?: DefaultValueGenerationOptions,
    currentDepth: number = 0
): any {
    if (schema._zod &&
        schema._zod.def &&
        schema._zod.def.shape
    ) {
        const objectSchemaShape = schema._zod.def.shape;

        const defaults: Record<string, any> = {};
    
        for (const key in objectSchemaShape) {
            defaults[key] = createZodSchemaDefaultValues(
                objectSchemaShape[key],
                options,
                currentDepth + 1
            );
        }

        return defaults;
    }

    return undefined;
}