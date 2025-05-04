import type { AdapterType, SchemaAdapter } from '../../types/schema/adapter';



const schemaAdapters = new Map<string, SchemaAdapter<any>>()

export function registerAdapter<T>(name: AdapterType, adapter: SchemaAdapter<T>) {
    schemaAdapters.set(name, adapter)
}

export function getAdapterForSchema(schema: any): SchemaAdapter<any> | null {
    // First check if it's a standard schema
    if (schema && typeof schema === 'object' && schema['~standard']) {
        // Find adapter that supports this standard schema vendor
        const vendor = schema['~standard'].vendor;
        for (const adapter of schemaAdapters.values()) {
            if (adapter.supportsVendor && adapter.supportsVendor(vendor)) {
                return adapter;
            }
        }
    }
    
    // Fall back to feature detection for non-standard schemas
    for (const adapter of schemaAdapters.values()) {
        if (adapter.isCompatible(schema)) {
            return adapter;
        }
    }
    
    return null;
}