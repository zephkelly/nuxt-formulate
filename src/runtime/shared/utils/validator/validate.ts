import { getAdapterForSchema } from './adapter-registry';
import type { SchemaType, InferSchemaType } from '../../types/schema';



export function handleValidate<T extends SchemaType>(schema: SchemaType, state: InferSchemaType<SchemaType>) {
    const adapter = getAdapterForSchema(schema);
    
    if (adapter) {
        return adapter.handleValidate(schema, state);
    }
    
    throw new Error('No adapter found for schema');
}