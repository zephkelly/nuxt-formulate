import { getAdapterForSchema } from './adapter-registry';
import type { SchemaType } from '../../types/schema';



export function handleValidationErrors(error: unknown, schema?: SchemaType): Record<string, any> {
    if (schema) {
        const adapter = getAdapterForSchema(schema);

        if (adapter) {
            return adapter.handleValidationErrors(error);
        }
    }

    return { error: 'Unknown validation error' };
}