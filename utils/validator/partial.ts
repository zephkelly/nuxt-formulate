import * as z from 'zod';

/**
 * Create a deeply partial version of a Zod schema
 * This works for objects, arrays, and interfaces
 */
export function createPartialSchema<T extends z.ZodType>(schema: T): z.ZodType {
    // For ZodObject and ZodInterface types
    if (
      schema instanceof z.ZodObject ||
      schema instanceof z.ZodInterface
    ) {
        //@ts-ignore
      const shape = schema.def.shape;
      const partialShape: Record<string, z.ZodType> = {};
      
      for (const key in shape) {
        const fieldSchema = shape[key];
        // Make each field optional and partial if it's an object
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
    
    // For ZodArray types
    if (schema instanceof z.ZodArray) {
      const elementSchema = schema.def.type;
      //@ts-expect-error
      return z.array(createPartialSchema(elementSchema));
    }
    
    // For other types, return as is but optional
    return schema;
  }