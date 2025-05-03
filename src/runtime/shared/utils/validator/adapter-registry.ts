import type { SchemaAdapter } from '../../types/schema/adapter';
import type { SchemaType } from '../../types/schema';



const schemaAdapters: SchemaAdapter<any>[] = [];

export function registerAdapter<T>(adapter: SchemaAdapter<T>) {
    schemaAdapters.push(adapter);
}

export function getAdapterForSchema(schema: SchemaType): SchemaAdapter<any> | null {
    for (const adapter of schemaAdapters) {
        if (adapter.isCompatible(schema)) {
            return adapter;
        }
    }
    
    return null;
}