import * as z from 'zod';



export function createDefaultValuesFromZodSchema(schema: z.ZodType): any {
    // --------------------------------------------------------------
    // Handle primitives
    // --------------------------------------------------------------
    if (schema instanceof z.core.$ZodArray) {
      return [];
    }
   
    // --------------------------------------------------------------
    // Handle interfaces and deprecated objects
    // --------------------------------------------------------------
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