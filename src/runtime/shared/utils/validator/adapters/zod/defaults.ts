import * as z from "@zod/core"



/**
 * Recursively populates default undefined values for a given Zod schema,
 * but breaking all schemas down to their base types.
 * 
 * @param schema The Zod schema to create default values for
 * @returns An object with default values for the schema
 */
export function createZodSchemaDefaultValues(schema: z.$ZodType): any {
    // move to schema._zod.def.type for checking
    const schemaType = schema._zod.def.type;
    
    // instanceof checks must traverse entire prototype chain: O(n).
    // Set ensure O(1) lookup time.
    if (schemaType === 'interface') {
        return handleZodInterface(schema);
    }
    
    if (schemaType === 'array') {
        return handleZodArray(schema);
    }
    
    // We can be reasonably sure that this is a $ZodType from here out,
    // but better safe than sorry.
    const schemaTraits = schema._zod.traits;
    if (schemaTraits.has('$ZodType')) {
        return createZodTypeSchemaDefaultValue(schema);
    }

    // Technically, $ZodInterface functions should be able to process
    // $ZodObject schemas, but we want to encourage Zod 4 beta adoption
    if (schemaTraits.has('$ZodObject')) {
        throw new Error('⚠️ z.object() is deprecated, please use z.interface() instead to define your schemas');
    }


    // We couldn't identify the schema type
    return undefined;
}



// -----------------------------------------------------------------------------
// Helper functions
// -----------------------------------------------------------------------------

// $ZodType
function createZodTypeSchemaDefaultValue(schema: z.$ZodType): any {
    if (!schema._zod) return undefined;


    // If the user defined a default for this field, use it
    if (schema._zod.def &&
        //@ts-expect-error
        schema._zod.def.defaultValue
    ) {
        // @ts-expect-error
        return schema._zod.def.defaultValue();
    }


    // If the field is a primitive type with only one valid
    // value, use that value
    if (schema._zod.values &&
        schema._zod.values.size === 1
    ) {
        return schema._zod.values.values().next().value;
    }

    // return createZodTypeSensibleDefaultValue(schema._zod.def)

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
function handleZodArray(schema: z.$ZodType): any {
    const zodArray = schema as z.$ZodArray<any>;

    // If the array contains a schema, we can send that back through the default
    // value function to recursively populate the default values
    if (schema._zod &&
        schema._zod.def &&
        //@ts-expect-error
        schema._zod.def.element &&
        //@ts-expect-error
        schema._zod.def.element.def &&
        //@ts-expect-error
        schema._zod.def.element.def.shape
    ) {
        //@ts-expect-error
        const arraySchemaShape = schema._zod.def.element.def.shape;

        const defaults: Record<string, any> = {};
    
        for (const key in arraySchemaShape) {
            defaults[key] = createZodSchemaDefaultValues(arraySchemaShape[key]);
        }

        return [ defaults ];
    }


    // The array contains a primitive type, so we can pass it through the
    // $ZodType default value function to get the default value
    if (schema._zod &&
        schema._zod.def &&
        //@ts-expect-error
        schema._zod.def.element &&
        //@ts-expect-error
        schema._zod.def.element.def &&
        //@ts-expect-error
        schema._zod.def.element.def.type
    ) {
        //@ts-expect-error
        return [createZodTypeSchemaDefaultValue(schema._zod.def.element.def)];
    }

    // Fallback to empty array
    return [];
}


// $ZodInterface
function handleZodInterface(schema: z.$ZodType): any {
    if (schema._zod &&
        schema._zod.def &&
        //@ts-expect-error
        schema._zod.def.shape
    ) {
        //@ts-expect-error
        const interfaceSchemaShape = schema._zod.def.shape;

        const defaults: Record<string, any> = {};
    
        for (const key in interfaceSchemaShape) {
            defaults[key] = createZodSchemaDefaultValues(interfaceSchemaShape[key]);
        }

        return defaults;
    }

    return undefined;
}