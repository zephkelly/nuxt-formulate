// utils/schema-utils.ts
import type { StandardSchemaV1 } from '@/types/standard-schema';
import * as z from 'zod';

// Helper to check if a schema is a Standard Schema
export function isStandardSchema(schema: any): schema is StandardSchemaV1 {
    return schema && typeof schema === 'object' && '~standard' in schema;
}

// Infer input type from any schema (Zod or Standard Schema)
export type InferSchemaType<T> = T extends StandardSchemaV1
    ? StandardSchemaV1.InferInput<T>
    : T extends z.ZodType
    ? z.infer<T>
    : never;