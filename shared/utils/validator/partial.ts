import * as z from 'zod';


export function createPartialSchema<T>(schema: any): any {
    if (isStandardSchema(schema)) {
      // TODO: Implement partial schema creation for StandardSchema
      return schema;
    }
    
    if (schema instanceof z.ZodType) {
      return createPartialZodSchema(schema);
    }
    
    return schema;
}

/**
 * Create a deeply partial version of a Zod schema
 * This works for objects, arrays, and interfaces
 */
export function createPartialZodSchema<T extends z.ZodType>(schema: T): z.ZodType {
    // -------------------------------------------------------------------------
    // Handle objects and interfaces
    // -------------------------------------------------------------------------
    if (
        schema instanceof z.ZodObject ||
        schema instanceof z.ZodInterface
    ) {
        //@ts-ignore
        const shape = schema.def.shape;
        const partialShape: Record<string, z.ZodType> = {};
      
        for (const key in shape) {
            const fieldSchema = shape[key];
            if (
                fieldSchema instanceof z.ZodObject ||
                fieldSchema instanceof z.ZodInterface ||
                fieldSchema instanceof z.ZodArray
            ) {
                partialShape[key] = createPartialSchema(fieldSchema).optional();
            } else {
                partialShape[key] = fieldSchema.optional();
            }
        }
      
        return schema instanceof z.ZodInterface
            ? z.interface(partialShape)
            : z.object(partialShape);
    }
    
    // -------------------------------------------------------------------------
    // Handle arrays
    // -------------------------------------------------------------------------
    if (schema instanceof z.ZodArray) {
        const elementSchema = schema.def.type;

        //@ts-ignore
        return z.array(createPartialSchema(elementSchema));
    }
    
    return schema;
}