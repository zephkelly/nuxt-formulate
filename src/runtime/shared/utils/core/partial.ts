import { getAdapterForSchema } from './adapter-registry';
import type { SchemaType } from '../../types/schema';



export function createPartialSchema<T extends SchemaType>(schema: T): Partial<T> {
    const adapter = getAdapterForSchema(schema);
    
    if (adapter) {
        return adapter.createPartialSchema(schema);
    }
    
    return schema;
}