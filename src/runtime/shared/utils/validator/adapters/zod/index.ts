import { registerAdapter } from '../../adapter-registry';

import type { SchemaAdapter } from "../../../../types/schema/adapter";

import { createZodPartialSchema } from "./partial";
import { createZodSchemaDefaultValues } from "./defaults";
import { handleZodSchemaValidationErrors } from "./errors";



/*
* Detect a zod schema using feature detection
* @param schema - The schema to check
* @returns True if the schema is a zod schema, false otherwise
*/
export function isZodSchema(schema: any): boolean {
    return schema && 
        typeof schema === 'object' && 
        typeof schema.parse === 'function' && 
        typeof schema._def === 'object';
}


export const ZodAdapter: SchemaAdapter<any> = {
    createDefaultValues(schema) {
        return createZodSchemaDefaultValues(schema);
    },
    
    createPartialSchema(schema) {
        return createZodPartialSchema(schema);
    },
    
    handleValidationErrors(error) {
        return handleZodSchemaValidationErrors(error);
    },
    
    isCompatible(schema) {
        return isZodSchema(schema);
    }
};

export function register() {
    if (import.meta.dev && import.meta.server) {
        console.log(
            '%c FORMULATE ', 'color: black; background-color: #0f8dcc; font-weight: bold; font-size: 1.15rem;',
            '⚡ Registering zod validator adapter'
        );
    }
    registerAdapter('zod', ZodAdapter);
}