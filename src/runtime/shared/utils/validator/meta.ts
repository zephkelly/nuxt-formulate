import { getAdapterForSchema } from './adapter-registry';
import type { DefaultValueGenerationOptions } from '../../types/defaults';



export function createMetaState(
    schema: any,
    options?: DefaultValueGenerationOptions
) {
    const adapter = getAdapterForSchema(schema);
    
    if (adapter) {
        return adapter.createMetaState(schema, options);
    }
    
    return {};
}