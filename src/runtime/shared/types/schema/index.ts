import type { StandardSchemaV1 } from './../../types/standard-schema/v1';


export type SchemaType = StandardSchemaV1;

export type InferSchemaInputType<T> = T extends StandardSchemaV1
  ? StandardSchemaV1.InferInput<T>
    : unknown

export type InferSchemaOutputType<T> = T extends StandardSchemaV1
  ? StandardSchemaV1.InferOutput<T>
    : unknown