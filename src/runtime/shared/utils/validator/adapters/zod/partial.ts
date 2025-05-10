import * as z from '@zod/core';



export function createZodPartialSchema<T extends z.$ZodType>(schema: z.$ZodType): z.$ZodAny {
    //@ts-ignore
    return schema.partial();
}