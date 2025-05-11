import type { Ref } from 'vue';
import { getAdapterForSchema } from './adapter-registry';
import type { DefaultValueGenerationOptions } from '../../types/defaults';

import { isDeepEqual } from '../equality';



export function createMetaState<SchemaType>(
    schema: any,
    options?: DefaultValueGenerationOptions
) {
    const adapter = getAdapterForSchema(schema);
    
    if (adapter) {
        return adapter.createMetaState(schema, options);
    }
    
    return {};
}

/**
 * Updates all dirty states in the entire meta state object
 */
export function updateAllDirtyStates(metaState: Ref<any>, current: any, initial: any) {
    const newMetaState = metaState.value;
    
    updateDirtyStateRecursively(current, initial, newMetaState, []);
    
    metaState.value = newMetaState;
}

/**
 * Recursively updates dirty states at all levels
 */
export function updateDirtyStateRecursively(
    current: any, 
    initial: any, 
    metaObj: any,
    path: string[]
): boolean {
    if (current === null || initial === null || 
        current === undefined || initial === undefined ||
        typeof current !== 'object' || typeof initial !== 'object') {
        
        return !isDeepEqual(current, initial);
    }
    
    if (Array.isArray(current) !== Array.isArray(initial)) {
        return true;
    }
    
    let anyDirty = false;
    
    if (Array.isArray(current)) {
        if (metaObj && 'items' in metaObj) {
            if (current.length !== initial.length) {
                metaObj.isDirty$ = true;
                return true;
            }
            
            for (let i = 0; i < current.length; i++) {
                if (i < metaObj.items.length) {
                    const itemDirty = updateDirtyStateRecursively(
                        current[i], 
                        initial[i], 
                        metaObj.items[i], 
                        [...path, `items[${i}]`]
                    );
                    
                    if (itemDirty) anyDirty = true;
                }
            }
        }
    } 
    else {
        for (const key in current) {
            if (!(key in metaObj)) continue;
            
            const currentValue = current[key];
            const initialValue = initial?.[key];
            
            if (typeof currentValue === 'object' && currentValue !== null && 
                typeof metaObj[key] === 'object' && metaObj[key] !== null) {
                
                const keyDirty = updateDirtyStateRecursively(
                    currentValue,
                    initialValue,
                    metaObj[key],
                    [...path, key]
                );
                
                metaObj[key].isDirty$ = keyDirty;
                
                if (keyDirty) anyDirty = true;
            } 
            else {
                const fieldDirty = !isDeepEqual(currentValue, initialValue);
                
                if (typeof metaObj[key] === 'object' && metaObj[key] !== null && 
                    'isDirty$' in metaObj[key]) {
                    metaObj[key].isDirty$ = fieldDirty;
                }
                
                if (fieldDirty) anyDirty = true;
            }
        }
    }
    
    if ('isDirty$' in metaObj) {
        metaObj.isDirty$ = anyDirty || !isDeepEqual(current, initial);
    }
    
    return anyDirty;
}