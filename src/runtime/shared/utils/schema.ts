import type { StandardSchemaV1 } from '~~/shared/types/standard-schema/v1';

export function isStandardSchema(schema: any): schema is StandardSchemaV1 {
    return schema && typeof schema === 'object' && '~standard' in schema;
}