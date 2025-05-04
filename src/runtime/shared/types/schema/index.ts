import type { StandardSchemaV1 } from './../../types/standard-schema/v1';



export type SchemaType = StandardSchemaV1 | any;

export type InferSchemaType<T> = T extends StandardSchemaV1
    ? StandardSchemaV1.InferInput<T>
    : T extends { _def: any, parse: Function } 
      ? T extends { extract: infer U } 
        ? U 
        : unknown
      : never;