import { getAdapterForSchema } from './adapter-registry';
import type { DefaultValueGenerationOptions } from '../../types/defaults';



export function createDefaultValues<T>(
    schema: any,
    options?: DefaultValueGenerationOptions
): T {
    const adapter = getAdapterForSchema(schema);
    
    if (adapter) {
        return adapter.createDefaultValues(schema, options);
    }
    
    return {} as T;
}