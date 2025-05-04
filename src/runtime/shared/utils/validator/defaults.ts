import { getAdapterForSchema } from './adapter-registry';



export function createDefaultValues<T>(schema: any): T {
    const adapter = getAdapterForSchema(schema);
    
    if (adapter) {
        return adapter.createDefaultValues(schema);
    }
    
    return {} as T;
}