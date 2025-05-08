import * as z from "@zod/core"



/**
 * Recursively populates default undefined values for a given Zod schema,
 * but breaking all schemas down to their base types.
 * 
 * @param schema The Zod schema to create default values for
 * @returns An object with default values for the schema
 */
export function createZodSchemaDefaultValues(schema: z.$ZodType): any {
    const schemaTraitsSet = schema._zod.traits

    // instanceof checks must traverse entire prototype chain: O(n).
    // Set ensure O(1) lookup time.
    if (schemaTraitsSet.has('$ZodInterface')) {
        return createZodInterfaceExplicitDefaultValues(schema);
    }
    
    if (schemaTraitsSet.has('$ZodArray')) {
        return createZodArrayExplicitUndefinedDefaultValues(schema);
    }

    if (schemaTraitsSet.has('$ZodType')) {
        return createZodTypeUndefinedDefaultValues(schema);
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
function createZodTypeUndefinedDefaultValues(schema: z.$ZodType): any {
    return undefined;
}

function createZodTypeSensibleDefaultValues(schema: z.$ZodType): any {
    return undefined;
}



// $ZodArray
// Returns:   { field: undefined }
function createZodArrayExplicitUndefinedDefaultValues(schema: z.$ZodType): any {
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

    // Fallback to implicit undefined
    return [{}];
}

// Returns:   [ { } ]
function createZodArrayImplicitUndefinedDefaultValues(schema: z.$ZodType, defaultCount: number = 0): any {
    if (defaultCount <= 0) {
        return [];
    }

    let defaults: any[] = [];
    for (let i = 0; i < defaultCount; i++) {
        defaults.push(createZodSchemaDefaultValues(schema));
    }

    // Fallback to implicit undefined
    return undefined;
}



// $ZodInterface
function createZodInterfaceExplicitDefaultValues(schema: z.$ZodType): any {
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

    // Fallback to implicit undefined
    return undefined;
}

function createZodInterfaceImplicitDefaultValues(schema: z.$ZodType): any {
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