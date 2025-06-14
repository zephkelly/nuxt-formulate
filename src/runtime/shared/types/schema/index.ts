import type { StandardSchemaV1 } from './../../types/standard-schema/v1';


export type SchemaType = StandardSchemaV1;

export type InferSchemaType<T> = T extends StandardSchemaV1
  ? StandardSchemaV1.InferInput<T>
    : unknown