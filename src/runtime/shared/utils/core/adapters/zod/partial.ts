import * as zCore from 'zod/v4/core';
import { z } from 'zod/v4';




// Helper function for exhaustive checking
function assertNever(value: never): never {
    throw new Error(`Unhandled case: ${value}`);
}

export function createZodPartialSchema(schema: z.ZodType | zCore.$ZodType): z.ZodAny | null {
    let schemaType: zCore.$ZodTypeDef['type'] = 'unknown';
    
    if (schema._zod && schema._zod.def) {
        schemaType = schema._zod.def.type;
    }
    // @ts-ignore
    else if (schema.type) {
        // @ts-ignore
        schemaType = schema.type;
    }

    switch (schemaType) {
        case 'object': {
            // @ts-ignore
            return schema.partial();
        }

        case 'interface': {
            // @ts-ignore
            return schema.partial();
        }

        case 'array': {
            // @ts-ignore
            return schema.element.partial();
        }

        case 'union': {
            const typedSchema = schema as z.ZodUnion;
            const typeSchemaDef = typedSchema.def as zCore.$ZodUnionDef;

            //@ts-expect-error
            if (typeSchemaDef && typeSchemaDef.discriminator) {
                //@ts-expect-error
                const discriminator = typeSchemaDef.discriminator;
                const unionObjects = typedSchema.options.map((option: zCore.$ZodType) => {
                    return createZodPartialSchema(option);
                });

                //@ts-expect-error
                return z.discriminatedUnion(discriminator, unionObjects);
            }
            console.warn(`Union schema without discriminator is not supported for partial schemas`);
            return null;
        }

        case 'pipe': {
            const typedSchema = schema as z.ZodPipe;

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
        case 'never':
        case 'nan':
        case 'optional':
        case 'nonoptional':
        case 'transform':
        case 'readonly':
        case 'nullable':
        case 'default':
        case 'prefault':
        case 'catch':
        case 'custom':
        case 'file':
        case 'literal':
        case 'template_literal': {
            //@ts-ignore
            return schema.optional();  
        }

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
        
        case 'enum': {
            console.warn(`File schema is not supported for partial schemas`);
            console.log(schema);
            return null
        }
        
        
        
        /// YET TO SUPPORT ---------------------------------------------------
        case 'intersection': {
            console.log(`Intersection schema is not supported for partial schemas`);
            console.log(schema);
            return null;
        }


        case 'success': {
            console.warn(`Success schema is not supported for partial schemas`);
            console.log(schema);
            return null;
        }

        case 'lazy': {
            console.warn(`Lazy schema is not supported for partial schemas`);
            console.log(schema);
            return null;
        }
        

        // WONT SUPPORT -----------------------------------------------------
        case 'promise': {
            throw new Error(`Promise schema is deprecated in Zod 4. Not supported for partial schemas`);
        }

        default: {
            // This is the exhaustive check - TypeScript will error if any cases are missing
            console.warn(`Zod schema of type ${schemaType} is not supported for partial schemas`);
            return assertNever(schemaType);
        }
    }
}