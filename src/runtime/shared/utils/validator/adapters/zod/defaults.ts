import * as z from "@zod/core"



/**
 * Populates default undefined values for a given Zod schema
 * 
 * @param schema The Zod schema to create default values for
 * @returns An object with default values for the schema
 */
export function createZodSchemaDefaultValues(schema: z.$ZodType): any {
    // -------------------------------------------------------------------------
    // Handle primitives
    // -------------------------------------------------------------------------
    if (schema instanceof z.$ZodArray) {
        return [];
    }
   
    // -------------------------------------------------------------------------
    // Handle interfaces and deprecated objects
    // -------------------------------------------------------------------------
    if (schema instanceof z.$ZodInterface) {
        //@ts-ignore
        const shape = schema.def.shape;
        const defaults: Record<string, any> = {};
        
        for (const key in shape) {
            defaults[key] = createZodSchemaDefaultValues(shape[key]);
        }
        
        return defaults;
    }

    // -------------------------------------------------------------------------
    // Embracing Zod 4 beta, no point in supporting deprecated objects
    // -------------------------------------------------------------------------
    if (schema instanceof z.$ZodObject) {
        throw new Error('⚠️ z.object() is not supported, please use z.interface() instead');
    }
   
    return undefined;
}