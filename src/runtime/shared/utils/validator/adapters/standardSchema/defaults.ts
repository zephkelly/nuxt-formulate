import { type Ref, unref, isRef } from 'vue';

import { type SchemaType } from '~/src/runtime/shared/types/schema';
import { getAdapterForSchema } from '../../adapter-registry';


export function createDefaultValues<T>(schemaOrRef: SchemaType | Ref<T>): T {
    if (isRef(schemaOrRef)) {
        return createDefaultsFromTemplate(unref(schemaOrRef));
    }
    
    const adapter = getAdapterForSchema(schemaOrRef);
    
    if (adapter) {
        return adapter.createDefaultValues(schemaOrRef);
    }
    
    if (typeof schemaOrRef === 'object' && schemaOrRef !== null) {
        return createDefaultsFromTemplate(schemaOrRef as any);
    }
    
    return {} as T;
}

function createDefaultsFromTemplate<T>(template: T, strategy: 'undefined' | 'empty' | 'reasonable' = 'reasonable'): T {
    if (template === null) {
        return null as T;
    }
    
    if (Array.isArray(template)) {
        return [] as unknown as T;
    }
    
    if (typeof template === 'object') {
        const result: Record<string, any> = {};
        
        // Iterate through keys to preserve structure
        for (const key in template) {
            const value = template[key as keyof T];
            result[key] = createDefaultsFromTemplate(value, strategy);
        }
        
        return result as T;
    }
    
    return getDefaultValueForType(typeof template as any, strategy) as T;
}

function getDefaultValueForType(
    type: 'string' | 'number' | 'boolean' | 'object' | 'undefined' | 'function' | 'symbol' | 'bigint',
    strategy: 'undefined' | 'empty' | 'reasonable'
): any {
    switch (strategy) {
        case 'undefined':
            return undefined;
        
        case 'empty':
            switch (type) {
                case 'string': return '';
                case 'number': return 0;
                case 'boolean': return false;
                case 'object': return {};
                default: return undefined;
            }
        
        case 'reasonable':
            switch (type) {
                case 'string': return '';
                case 'number': return 0;
                case 'boolean': return false;
                case 'object': return {};
                default: return undefined;
            }
    }
}