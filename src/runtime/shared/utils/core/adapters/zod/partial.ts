import * as z from 'zod/v4/core';



export function createZodPartialSchema<T extends z.$ZodType>(schema: z.$ZodType): z.$ZodAny {
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
        return schema.partial();
    }
    
    if (schemaType === 'array') {
        //@ts-ignore - We know the type is an array
        return schema.element.partial()
    }

    throw new Error(`Zod schema of type ${schemaType} is not supported for partial schemas`);
}