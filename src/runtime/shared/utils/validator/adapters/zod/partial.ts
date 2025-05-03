import * as z from '@zod/core';



/**
 * Create a deeply partial version of a Zod schema
 * This works for objects, arrays, and interfaces
 */
export function createZodPartialSchema<T extends z.$ZodType>(schema: T): z.$ZodType {
    // -------------------------------------------------------------------------
    // Handle interfaces
    // -------------------------------------------------------------------------
    if (
        schema instanceof z.$ZodInterface
    ) {
        //@ts-ignore
        return schema.partial();
        // const shape = schema.def.shape;
        // const partialShape: Record<string, z.$ZodType> = {};
      
        // for (const key in shape) {
        //     const fieldSchema = shape[key];
        //     if (
        //         fieldSchema instanceof z.$ZodInterface ||
        //         fieldSchema instanceof z.$ZodArray
        //     ) {
        //         //@ts-expect-error
        //         partialShape[key] = createZodPartialSchema(fieldSchema).optional();
        //     } else {
        //         partialShape[key] = fieldSchema.optional();
        //     }
        // }
      
        // return z._interface(partialShape)
    }
    
    // -------------------------------------------------------------------------
    // Handle arrays
    // -------------------------------------------------------------------------
    if (schema instanceof z.$ZodArray) {
        //@ts-ignore
        return z.array(schema.partial()).optional();
    }
    
    return schema;
}