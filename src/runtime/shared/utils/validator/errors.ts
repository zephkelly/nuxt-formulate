import { getAdapterForSchema } from './adapter-registry';
import type { SchemaType } from '../../types/schema';



export function handleValidationErrors(error: unknown, schema?: SchemaType): Record<string, any> {
    if (schema) {
        const adapter = getAdapterForSchema(schema);

        if (adapter) {
            return adapter.handleValidationErrors(error);
        }
    }
    
    // Try to find an adapter that can handle this error
    // This is useful when we don't have the schema (like in existing code)
    // const { ZodAdapter } = require('./adapters/zod-adapter');
    // if (error && typeof error === 'object' && 'name' in error && error.name === 'ZodError') {
    //     return ZodAdapter.handleValidationErrors(error);
    // }
    
    // // const { StandardSchemaAdapter } = require('./adapters/standard-adapter');
    // if (error && typeof error === 'object' && 'issues' in error) {
    //     return StandardSchemaAdapter.handleValidationErrors(error);
    // }
    
    // Fallback for unknown error types
    return { error: 'Unknown validation error' };
}