import * as z from '@zod/core';
import { registerAdapter } from '../../adapter-registry';

import type { SchemaAdapter } from "../../../../types/schema/adapter";

import { createZodPartialSchema } from "./partial";
import { createZodSchemaDefaultValues } from "./defaults";
import { handleZodSchemaValidationErrors } from "./errors";

import type { DefaultValueGenerationOptions } from '../../../../types/defaults';


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
    createDefaultValues(schema: z.$ZodAny, options?: DefaultValueGenerationOptions): any {
        return createZodSchemaDefaultValues(schema, options);
    },
    
    createPartialSchema(schema) {
        return createZodPartialSchema(schema);
    },

    handleValidate(state) {
        const { schema, data } = state;
        try {
            return schema.parse(data);
        }
        catch (error: unknown) {
            if (error instanceof z.$ZodError) {
                return handleZodSchemaValidationErrors(error);
            }

            throw error;
        }
    },
    
    isCompatible(schema) {
        return isZodSchema(schema);
    }
};

export function register() {
    if (import.meta.dev && import.meta.server) {
        console.log(
            '%c FORMULATE ', 'color: black; background-color: #0f8dcc; font-weight: bold; font-size: 1.15rem;',
            '⚡ Registering Zod adapter'
        );
    }
    registerAdapter('zod', ZodAdapter);
}