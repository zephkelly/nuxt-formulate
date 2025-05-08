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
    const schemaTraitsSet = schema._zod.traits

    // instanceof checks must traverse entire prototype chain: O(n).
    // Set ensure O(1) lookup time.
    if (schemaTraitsSet.has('$ZodInterface')) {
        return handleZodInterface(schema);
    }
    
    if (schemaTraitsSet.has('$ZodArray')) {
        return handleZodArray(schema);
    }

    if (schemaTraitsSet.has('$ZodType')) {
        return createZodTypeSchemaDefaultValues(schema);
    }

    // Technically, $ZodInterface functions should be able to process
    // $ZodObject schemas, but we want to encourage Zod 4 beta adoption
    if (schemaTraitsSet.has('$ZodObject')) {
        throw new Error('⚠️ z.object() is deprecated, please use z.interface() instead to define your schemas');
    }


    // We couldn't identify the schema type
    return undefined;
}



// -----------------------------------------------------------------------------
// Helper functions
// -----------------------------------------------------------------------------

// $ZodType
function createZodTypeSchemaDefaultValues(schema: z.$ZodType): any {
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

    return undefined;
}



// $ZodArray
function handleZodArray(schema: z.$ZodType): any {
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

    // Fallback to implicit undefined single item array
    return [{}];
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