import * as z from 'zod';
import type { StandardSchemaV1 } from './../../types/standard-schema/v1';



export type SchemaType = z.ZodType | StandardSchemaV1;

export type InferSchemaType<T> = T extends StandardSchemaV1
    ? StandardSchemaV1.InferInput<T>
    : T extends z.ZodType
    ? z.infer<T>
    : never;

export type ErrorsFromSchema<T> = {
    [K in keyof T]?: T[K] extends object ? ErrorsFromSchema<T[K]> : string;
};