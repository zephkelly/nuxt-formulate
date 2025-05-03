import * as z from 'zod';
import { type StandardSchemaV1 } from '~~/shared/types/standard-schema/v1';
import { isStandardSchema } from '~~/shared/utils/schema'



export function createDefaultValues<T>(schema: any): T {
    if (isStandardSchema(schema)) {
      return createDefaultValuesFromStandardSchema(schema);
    }
    
    if (schema instanceof z.ZodType) {
      return createDefaultValuesFromZodSchema(schema);
    }
    
    return {} as T;
}
  
function createDefaultValuesFromStandardSchema<T extends StandardSchemaV1>(schema: T): any {
    // Perhaps need to inspect schema via reflection?
    return {};
}


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