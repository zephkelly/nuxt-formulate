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

export function syncArraysWithMetaState(
    metaState: any,
    state: any,
    schema: any,
    options?: DefaultValueGenerationOptions
) {
    const adapter = getAdapterForSchema(schema);
    
    if (adapter) {
        return adapter.syncArraysWithMetaState(metaState, state, schema, options);
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
        console.log('isDirty$', path, anyDirty);
        metaObj.isDirty$ = anyDirty || !isDeepEqual(current, initial);
    }
    
    return anyDirty;
}

/**
 * Updates all validation states in the metastate
 * Called after metastate structure is synchronized
 */
export function updateValidationStates(
    metaState: any,
    validationResult: any,
    errorState: any
) {
    // Reset all validation states
    resetAllValidationStates(metaState);
    
    // If there are errors, mark the appropriate fields as invalid
    if (errorState && typeof errorState === 'object') {
        markInvalidFields(metaState, errorState);
    } else {
        // If no errors, all fields are valid
        markAllFieldsValid(metaState);
    }
}

/**
 * Recursively resets all validation states to prepare for revalidation
 */
function resetAllValidationStates(metaState: any) {
    if (!metaState) return;
    
    // Reset current level
    if ('isValid' in metaState) {
        metaState.isValid$ = true;
    }
    
    // Process object properties
    for (const key in metaState) {
        if (key === 'items' && Array.isArray(metaState[key])) {
            // Handle array items
            metaState[key].forEach(item => resetAllValidationStates(item));
        } else if (typeof metaState[key] === 'object' && metaState[key] !== null) {
            // Handle nested objects
            resetAllValidationStates(metaState[key]);
        }
    }
}

/**
 * Marks fields as invalid based on error state
 */
function markInvalidFields(metaState: any, errorState: any) {
    if (!metaState || !errorState) return;
    
    // Mark current level as invalid if it has an error
    if ('error' in errorState && errorState.error && 'isValid' in metaState) {
        metaState.isValid$ = false;
    }
    
    // Process object properties
    for (const key in errorState) {
        if (key === 'items' && Array.isArray(errorState[key]) && 'items' in metaState && Array.isArray(metaState.items)) {
            // Handle array items
            errorState[key].forEach((itemError, index) => {
                if (itemError && index < metaState.items.length) {
                    markInvalidFields(metaState.items[index], itemError);
                }
            });
        } else if (key in metaState && typeof errorState[key] === 'object' && errorState[key] !== null) {
            // Handle nested objects
            markInvalidFields(metaState[key], errorState[key]);
        }
    }
}

/**
 * Marks all fields as valid (used when no errors)
 */
function markAllFieldsValid(metaState: any) {
    if (!metaState) return;
    
    // Mark current level as valid
    if ('isValid' in metaState) {
        metaState.isValid$ = true;
    }
    
    // Process object properties
    for (const key in metaState) {
        if (key === 'items' && Array.isArray(metaState[key])) {
            // Handle array items
            metaState[key].forEach(item => markAllFieldsValid(item));
        } else if (typeof metaState[key] === 'object' && metaState[key] !== null) {
            // Handle nested objects
            markAllFieldsValid(metaState[key]);
        }
    }
}