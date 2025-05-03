import type { SchemaAdapter } from '~~/shared/types/schema/adapter';
import type { StandardSchemaV1 } from '~~/shared/types/standard-schema/v1';

import { createStandardSchemaPartialSchema } from './partial';
import { createDefaultValuesFromStandardSchema } from './defaults';
import { handleStandardSchemaErrors } from './errors';



function isStandardSchema(schema: any): schema is StandardSchemaV1 {
    return schema && typeof schema === 'object' && '~standard' in schema;
}

export const StandardSchemaAdapter: SchemaAdapter<StandardSchemaV1> = {
    createDefaultValues(schema) {
        return createDefaultValuesFromStandardSchema(schema);
    },
    
    createPartialSchema(schema) {
        return createStandardSchemaPartialSchema(schema);
    },
    
    handleValidationErrors(error) {
        return handleStandardSchemaErrors(error);
    },
    
    isCompatible(schema) {
        return isStandardSchema(schema);
    }
};