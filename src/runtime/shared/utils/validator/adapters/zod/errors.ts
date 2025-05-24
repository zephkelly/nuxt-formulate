import * as z from 'zod/v4/core';

import type { ErrorStateType } from '~/src/runtime/shared/types/error';



/**
 * Type definitions for Zod treeified error structure
 */
export interface ZodTreeError {
    errors: string[];
    properties?: Record<string, ZodTreeError>;
    items?: (ZodTreeError | undefined)[];
}

/**
 * Type definition for restructured error output
 */
export type RestructuredZodErrors<T = unknown> = T extends object
    ? {
        [K in keyof T]?: T[K] extends (infer U)[]
            ? { items?: (RestructuredZodErrors<U> | undefined)[] }
            : RestructuredZodErrors<T[K]>;
    } & { error?: string }
    : { error?: string };



/**
 * Restructures a Zod treeified error object to make errors more accessible
 * while maintaining the hierarchy but flattening the top level
 * @param treeError The result of z.treeifyError()
 * @returns A restructured object   simplified error access
 */
export function restructureZodErrors<T = unknown>(treeError: any): ErrorStateType<T> {
    let result: Record<string, any> = {};
    
    // Handle current item errors
    if (treeError.properties) {
        Object.entries(treeError.properties).forEach(([key, value]) => {
            result[key] = restructureZodErrors(value);
        });
    }
    
    // Handle nested item errors
    if (treeError.items) {
        result.items = [];
        
        treeError.items.forEach((item: any, index: number) => {
            if (item) {
                result.items[index] = restructureZodErrors(item);
            }
            else {
                result.items[index] = undefined;
            }
        });
    }
    
    // Handle non-top-level errors
    if (treeError.errors && treeError.errors.length > 0) {
        result = treeError.errors[0];
    }
    
    return result  as ErrorStateType<T>;
}


export function handleZodSchemaValidationErrors<T = unknown>(
    error: z.$ZodError
): ErrorStateType<T> {
    const tree = z.treeifyError(error);
    return restructureZodErrors<T>(tree);
}