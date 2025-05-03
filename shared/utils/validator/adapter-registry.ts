import type { SchemaAdapter } from '~~/shared/types/schema/adapter';
import type { SchemaType } from '~~/shared/types/schema';



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