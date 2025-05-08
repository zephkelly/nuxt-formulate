import * as z from '@zod/core';



export function createZodPartialSchema<T extends z.$ZodType>(schema: T): z.$ZodType {
    // -------------------------------------------------------------------------
    // Handle interfaces
    // -------------------------------------------------------------------------
    if (
        schema instanceof z.$ZodInterface
    ) {
        //@ts-ignore
        return schema.partial();
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