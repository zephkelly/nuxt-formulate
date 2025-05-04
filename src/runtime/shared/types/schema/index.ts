import type { StandardSchemaV1 } from './../../types/standard-schema/v1';



export type ZodSchema = { _def: any, parse: Function };

export type SchemaType = StandardSchemaV1 | ZodSchema;

export type InferSchemaType<T> = T extends StandardSchemaV1
  ? StandardSchemaV1.InferInput<T>
  : T extends ZodSchema
    ? T extends { extract: infer U } 
      ? U 
      : unknown
    : never