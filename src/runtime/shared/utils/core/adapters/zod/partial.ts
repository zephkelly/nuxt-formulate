import * as zCore from 'zod/v4/core';
import { z } from 'zod/v4';



export function createZodPartialSchema<T extends zCore.$ZodType>(schema: zCore.$ZodType, preserveField?: string): zCore.$ZodAny {
    let schemaType: zCore.$ZodTypeDef['type'] = 'unknown';
    if (schema._zod && schema._zod.def) {
        schemaType = schema._zod.def.type;
    }
    //@ts-expect-error
    else if (schema.type) {
        // @ts-expect-error
        schemaType = schema.type;
    }

    if (schemaType === 'object') {
        //@ts-ignore - The follow is used to preserve literal values in-case discriminated unions don't
        // like working with partials discriminators
        // if (preserveField && schema.shape && schema.shape[preserveField]) {
        //     //@ts-ignore
        //     const shape = { ...schema.shape };
        //     const objectToPreserve = shape[preserveField];

        //     //@ts-ignore
        //     return z.object({
        //         //@ts-ignore
        //         ...{ ...schema.partial().shape },
        //         [preserveField]: objectToPreserve
        //     });
        // }

        //@ts-ignore
        return schema.partial();
    }
    
    if (schemaType === 'array') {
        //@ts-ignore - We know the type is an array
        return schema.element.partial()
    }

    if (schemaType === 'union') {
        //@ts-ignore - We know the type is a union
        
        //@ts-ignore
        if (schema._def && schema._def.discriminator) {
            //@ts-ignore
            const discriminator = schema._def.discriminator;
            //@ts-ignore
            const unionObjects = schema.options.map((option: zCore.$ZodType) => {
                return createZodPartialSchema(option, discriminator);
            });

            //@ts-ignores
            return z.discriminatedUnion(discriminator, unionObjects);
        }
    }


    throw new Error(`Zod schema of type ${schemaType} is not supported for partial schemas`);
}