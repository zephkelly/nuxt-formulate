import { getAdapterForSchema } from './adapter-registry';
import type { SchemaType, InferSchemaInputType, InferSchemaOutputType } from '../../types/schema';



export function handleValidate<TSchema extends SchemaType>(schema: SchemaType | Partial<InferSchemaInputType<TSchema>>, state: InferSchemaOutputType<SchemaType>) {
    const adapter = getAdapterForSchema(schema);
    
    if (adapter) {
        return adapter.handleValidate(schema, state);
    }
    
    console.warn(`No adapter found for schema type: ${typeof schema}`);
}