import { getAdapterForSchema } from './adapter-registry';
import type { SchemaType, InferSchemaType } from '../../types/schema';



export function handleValidate<TSchema extends SchemaType>(schema: SchemaType | Partial<InferSchemaType<TSchema>>, state: InferSchemaType<SchemaType>) {
    const adapter = getAdapterForSchema(schema);
    
    if (adapter) {
        return adapter.handleValidate(schema, state);
    }
    
    throw new Error('No adapter found for schema');
}