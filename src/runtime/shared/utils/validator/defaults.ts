import { getAdapterForSchema } from './adapter-registry';
import type { SchemaType } from '../../types/schema';



export function createDefaultValues<T>(schema: SchemaType): T {
    const adapter = getAdapterForSchema(schema);
    
    if (adapter) {
        return adapter.createDefaultValues(schema);
    }
    
    // Unknown schema type, return empty object
    return {} as T;
}