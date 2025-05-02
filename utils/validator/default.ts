import * as z from 'zod';



/**
 * Populates default undefined values for a given Zod schema
 * 
 * @param schema The Zod schema to create default values for
 * @returns An object with default values for the schema
 */
export function createDefaultValuesFromZodSchema(schema: z.ZodType): any {
    // -------------------------------------------------------------------------
    // Handle primitives
    // -------------------------------------------------------------------------
    if (schema instanceof z.core.$ZodArray) {
      return [];
    }
   
    // -------------------------------------------------------------------------
    // Handle interfaces and deprecated objects
    // -------------------------------------------------------------------------
    if (schema instanceof z.core.$ZodInterface || schema instanceof z.core.$ZodObject) {
        //@ts-expect-error
        const shape = schema.def.shape;
        const defaults: Record<string, any> = {};
        
        for (const key in shape) {
            defaults[key] = createDefaultValuesFromZodSchema(shape[key]);
        }
        
        return defaults;
    }
   
    return undefined;
}