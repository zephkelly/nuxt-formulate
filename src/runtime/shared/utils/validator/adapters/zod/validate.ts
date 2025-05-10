import * as z from '@zod/core';



export function handleZodValidate<T extends z.$ZodType>(schema: z.$ZodAny) {
    try {
        //@ts-ignore
        return schema.parse();
    }
    catch (error) {
        console.log(error)
    }
}