import type { AdapterType, SchemaAdapter } from '../../types/schema/adapter';



const schemaAdapters = new Map<string, SchemaAdapter<any>>()

export function registerAdapter<T>(name: AdapterType, adapter: SchemaAdapter<T>) {
    schemaAdapters.set(name, adapter)
}

export function getAdapterForSchema(schema: any): SchemaAdapter<any> | null {
    for (const adapter of schemaAdapters.values()) {
        if (adapter.isCompatible(schema)) {
            return adapter
        }
    }

    return null
}