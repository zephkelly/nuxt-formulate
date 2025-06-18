import * as zCore from 'zod/v4/core';
import { z } from 'zod/v4';




// Helper function for exhaustive checking
function assertNever(value: never): never {
    throw new Error(`Unhandled case: ${value}`);
}

export function createZodPartialSchema<T extends zCore.$ZodType>(
    schema: zCore.$ZodType, 
    preserveField?: string
): zCore.$ZodAny | null {
    let schemaType: zCore.$ZodTypeDef['type'] = 'unknown';
    
    if (schema._zod && schema._zod.def) {
        schemaType = schema._zod.def.type;
    }
    // @ts-expect-error
    else if (schema.type) {
        // @ts-expect-error
        schemaType = schema.type;
    }

    switch (schemaType) {
        case 'object': {
            // @ts-ignore
            return schema.partial();
        }

        case 'interface': {
            // @ts-ignore - The following is used to preserve literal values in case discriminated unions
            return schema.partial();
        }

        case 'array': {
            // @ts-ignore - We know the type is an array
            return schema.element.partial();
        }

        case 'union': {
            // @ts-ignore
            if (schema._def && schema._def.discriminator) {
                // @ts-ignore
                const discriminator = schema._def.discriminator;
                // @ts-ignore
                const unionObjects = schema.options.map((option: zCore.$ZodType) => {
                    return createZodPartialSchema(option, discriminator);
                });
                // @ts-ignore
                return z.discriminatedUnion(discriminator, unionObjects);
            }
            console.warn(`Union schema without discriminator is not supported for partial schemas`);
            return null;
        }

        case 'pipe': {
            const typedSchema = schema as z.ZodPipe;


            // for a pip schema, there is an in object and an out ZodTransform
            const inSchema = typedSchema.def.in;
            const outSchema = typedSchema.def.out;

            const partialInSchema = createZodPartialSchema(inSchema);
            const partialOutSchema = createZodPartialSchema(outSchema);

            if (!partialInSchema || !partialOutSchema) {
                console.warn(`Partial schema could not be created for pipe schema`);
                return null;
            }
            
            // @ts-ignore - We know the type is a pipe
            return z.pipe(partialInSchema, partialOutSchema);
        }

        // Primitive types that don't need partial conversion
        case 'string':
        case 'number':
        case 'bigint':
        case 'int':
        case 'boolean':
        case 'date':
        case 'symbol':
        case 'undefined':
        case 'null':
        case 'void':
        case 'any':
        case 'unknown':
            return null;

        case 'tuple': {
            console.warn(`Tuple schema is not supported for partial schemas`);
            console.log(schema);
            return null;
        }

        case 'record': {
           console.warn(`Record schema is not supported for partial schemas`);
           console.log(schema);
            return null;
        }

        case 'map': {
            console.warn(`Map schema is not supported for partial schemas`);
            console.log(schema);
            return null;
        }

        case 'set': {
            console.warn(`Set schema is not supported for partial schemas`);
            console.log(schema);
            return null;
        }

        case 'intersection': {
            console.log(`Intersection schema is not supported for partial schemas`);
            console.log(schema);
            return null;
        }

        case 'optional': {
            console.warn(`Optional schema is not supported for partial schemas`);
            console.log(schema);
            return null;
        }

        case 'nullable': {
            console.warn(`Nullable schema is not supported for partial schemas`);
            console.log(schema);
            return null;
        }

        case 'default': {
            console.warn(`Default schema is not supported for partial schemas`);
            console.log(schema);    
            return null;
        }

        case 'catch': {
            console.warn(`Catch schema is not supported for partial schemas`);
            console.log(schema);
            return null;
        }

        case 'promise': {
            console.warn(`Promise schema is not supported for partial schemas`);
            console.log(schema);
            return null;
        }

        case 'lazy': {
            console.warn(`Lazy schema is not supported for partial schemas`);
            console.log(schema);
            return null;
        }

        case 'readonly': {
            console.warn(`Readonly schema is not supported for partial schemas`);
            console.log(schema);
            return null;
        }

        case 'never': {
            // @ts-ignore
            return z.never();
        }

        case 'success': {
            console.warn(`Success schema is not supported for partial schemas`);
            console.log(schema);
            return null;
        }

        case 'file': {
            console.warn(`File schema is not supported for partial schemas`);
            console.log(schema);
            return null;
        }

        case 'enum': {
            console.warn(`File schema is not supported for partial schemas`);
            console.log(schema);
            return null
        }

        case 'literal': {
            console.warn(`Literal schema is not supported for partial schemas`);
            console.log(schema);
            return null;
        }

        case 'nonoptional': {
            console.warn(`Nonoptional schema is not supported for partial schemas`);
            console.log(schema);
            return null;
        }

        case 'transform': {
            const typedSchema = schema as z.ZodTransform<any, any>;

            //@ts-ignore
            return typedSchema.optional();  
        }

        case 'prefault': {
            console.warn(`Prefault schema is not supported for partial schemas`);
            console.log(schema);
            return null;
        }

        case 'nan': {
            console.warn(`NaN schema is not supported for partial schemas`);
            console.log(schema);
            return null;
        }

        case 'template_literal': {
            console.warn(`Template literal schema is not supported for partial schemas`);
            console.log(schema);
            return null;
        }

        case 'custom': {
            console.warn(`Custom schema is not supported for partial schemas`);
            console.log(schema);
            return null;
        }

        default: {
            // This is the exhaustive check - TypeScript will error if any cases are missing
            console.log(schema);
            console.warn(`Zod schema of type ${schemaType} is not supported for partial schemas`);
            return assertNever(schemaType);
        }
    }
}