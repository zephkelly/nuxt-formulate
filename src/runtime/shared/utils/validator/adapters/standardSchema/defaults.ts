import { type StandardSchemaV1 } from '../../../../types/standard-schema/v1';



export function createDefaultValuesFromStandardSchema<T extends StandardSchemaV1>(schema: T): any {
    // Perhaps need to inspect schema via reflection?
    return {};
}