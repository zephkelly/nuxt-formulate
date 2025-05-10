import { getAdapterForSchema } from './adapter-registry';
import type { SchemaType } from '../../types/schema';



export function handleValidate<T extends SchemaType>(schema: T): T {
    const adapter = getAdapterForSchema(schema);
    
    if (adapter) {
        return adapter.handleValidate(schema);
    }
    
    return schema;
}