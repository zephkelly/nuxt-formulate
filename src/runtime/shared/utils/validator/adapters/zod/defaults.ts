import * as z from "@zod/core"

import type { DefaultValueGenerationOptions } from "../../../../types/defaults";



/**
 * Recursively populates default undefined values for a given Zod schema,
 * but breaking all schemas down to their base types.
 * 
 * @param schema The Zod schema to create default values for
 * @returns An object with default values for the schema
 */
export function createZodSchemaDefaultValues(
    schema: z.$ZodAny,
    options?: DefaultValueGenerationOptions,
    currentDepth: number = 0
): any {
    // This determines the type of schema we are dealing with
    let schemaType: z.$ZodTypeDef['type'] = 'unknown';
    if (schema._zod && schema._zod.def) {
        schemaType = schema._zod.def.type;
    }
    //@ts-expect-error
    else if (schema.type) {
        // @ts-expect-error
        schemaType = schema.type;
    }
    

    if (schemaType === 'interface') {
        //@ts-ignore - We know the type is an interface
        return handleZodInterface(schema as z.$ZodInterface, options, currentDepth);
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

// $ZodType
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

            //if the value is not null or undefined, then this is a literal
            // we should have special handling for literal values in the default
            // options

            return schema._zod.values.values().next().value;
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

        default:
            const exhaustiveCheck: never = fieldDefinition.type;
            throw new Error(`⚠️ Internal Formulate error: New unhandled Zod type: ${exhaustiveCheck}`);
        }
}



// $ZodArray
function handleZodArray(
    schema: z.$ZodArray, 
    options?: DefaultValueGenerationOptions,
    currentDepth: number = 0  // Track current depth
): any {
    const { arrays = 'empty' } = options || {};

    console.log(`Handling array at depth ${currentDepth}`);
    
    // Check depth configuration
    const depthConfig = typeof arrays === 'object' && arrays !== null && 'depth' in arrays 
        ? arrays.depth 
        : undefined;
    
    // If depth config exists
    if (depthConfig) {
        const fallback = depthConfig.fallback || 'empty';
        let shouldUseFallback = false;
        
        // CASE 1: Using max depth
        if (depthConfig.max !== undefined) {
            // Use fallback if we're at or beyond max depth
            shouldUseFallback = currentDepth >= depthConfig.max;
        }
        // CASE 2: Using explicit layers
        else if (depthConfig.layers !== undefined && depthConfig.layers.length > 0) {
            // Use fallback if current depth is NOT in the layers array
            shouldUseFallback = !depthConfig.layers.includes(currentDepth);
        }
        
        // Apply fallback if determined by either max or layers logic
        if (shouldUseFallback) {
            if (fallback === 'empty') return [];
            if (fallback === 'undefined') return undefined;
            if (fallback === 'null') return null;
            // If fallback is 'populate', we'll continue with normal array processing
        }
    }
    
    // Normal array processing based on the arrays option
    if (typeof arrays === 'string') {
        if (arrays === 'empty') return [];
        if (arrays === 'undefined') return undefined;
        if (arrays === 'null') return null;
        if (arrays === 'populate') {
            // Increment depth when generating array items
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
            // Increment depth when generating array items
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


// $ZodInterface
function handleZodInterface(
    schema: z.$ZodInterface,
    options?: DefaultValueGenerationOptions,
    currentDepth: number = 0
): any {
    if (schema._zod &&
        schema._zod.def &&
        schema._zod.def.shape
    ) {
        const interfaceSchemaShape = schema._zod.def.shape;

        const defaults: Record<string, any> = {};
    
        for (const key in interfaceSchemaShape) {
            defaults[key] = createZodSchemaDefaultValues(
                interfaceSchemaShape[key],
                options,
                currentDepth + 1
            );
        }

        return defaults;
    }

    return undefined;
}