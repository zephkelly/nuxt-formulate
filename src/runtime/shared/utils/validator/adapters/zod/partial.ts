import * as z from '@zod/core';



export function createZodPartialSchema<T extends z.$ZodType>(schema: z.$ZodType): z.$ZodAny {
    // Handle interfaces
    if (
        schema instanceof z.$ZodInterface
    ) {
        //@ts-ignore
        return schema.partial();
    }
    
    // Handle arrays
    if (schema instanceof z.$ZodArray) {
        //@ts-ignore
        return z.array(schema.partial()).optional();
    }
    
    throw new Error('Unsupported Zod schema type for partial creation');
}