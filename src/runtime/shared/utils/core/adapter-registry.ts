import type { SchemaAdapter } from '../../types/schema/adapter';
import type { AdapterType } from '../../types/schema/adapter';



const schemaAdapters = new Map<string, SchemaAdapter<any>>()

export function registerAdapter<T>(name: AdapterType, adapter: SchemaAdapter<T>) {
    schemaAdapters.set(name, adapter)
}

export function getAdapterForSchema(schema: any): SchemaAdapter<any> | null {
    if (schema && typeof schema === 'object' && schema['~standard']) {
        const vendor = schema['~standard'].vendor;

        console.log(schemaAdapters.values())
        for (const adapter of schemaAdapters.values()) {
            if (adapter.supportsVendor && adapter.supportsVendor(vendor)) {
                return adapter;
            }
        }
    }
    
    for (const adapter of schemaAdapters.values()) {
        if (adapter.isCompatible(schema)) {
            return adapter;
        }
    }
    
    return null;
}