import * as z from 'zod/v4/core';
import { registerAdapter } from '../../adapter-registry';

import type { SchemaAdapter } from "../../../../types/schema/adapter";

import { createZodPartialSchema } from "./partial";
import { createZodSchemaDefaultValues } from "./defaults";
import { createMetaState, syncArraysWithMetaState } from "./meta";
import { handleZodSchemaValidationErrors } from "./errors";

import type { DefaultValueGenerationOptions } from '../../../../types/defaults';
import { handleZodValidate } from './validate';



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
        return createZodPartialSchema(schema as z.$ZodAny);
    },

    createMetaState(schema, options?: DefaultValueGenerationOptions) {
        return createMetaState(schema as z.$ZodAny, options);
    },

    syncArraysWithMetaState(metaState: any, state: z.infer<z.$ZodAny>, schema: z.$ZodAny, options?: DefaultValueGenerationOptions) {
        return syncArraysWithMetaState(metaState, state, schema, options);
    },

    handleValidate(schema: z.$ZodAny, state: z.infer<z.$ZodAny> ) {
        return handleZodValidate(schema, state);
    },

    handleValidationErrors(error: z.$ZodError) {
        return handleZodSchemaValidationErrors(error);
    },
    
    isCompatible(schema) {
        return isZodSchema(schema);
    }
};

export function register() {
    registerAdapter('zod', ZodAdapter);
}