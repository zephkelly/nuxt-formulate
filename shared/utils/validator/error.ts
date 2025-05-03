import * as z from 'zod';
import type { StandardSchemaV1 } from '~~/shared/types/standard-schema/v1';



export type ErrorsFromSchema<T> = {
    [K in keyof T]?: T[K] extends object ? ErrorsFromSchema<T[K]> : string;
};

export function convertStandardSchemaErrors(
    issues: ReadonlyArray<StandardSchemaV1.Issue>
): Record<string, any> {
    const result: Record<string, any> = {};
    
    for (const issue of issues) {
        if (!issue.path || issue.path.length === 0) {
            // Top-level error
            if (!result.error) result.error = issue.message;
            continue;
        }
        
        let current = result;
        for (let i = 0; i < issue.path.length - 1; i++) {
            const segment: PropertyKey | StandardSchemaV1.PathSegment | undefined = issue.path[i];
            if (!segment) continue;

            const key = typeof segment === 'object' && segment !== null 
                ? String(segment.key) 
                : String(segment);
            
            if (!current[key]) current[key] = {};
            current = current[key];
        }
        
        const lastSegment = issue.path[issue.path.length - 1];
        const lastKey = typeof lastSegment === 'object' && lastSegment !== null
            ? String(lastSegment.key)
            : String(lastSegment);
        current[lastKey] = issue.message;
    }
    
    return result;
}


// --------------------------------------------------------------------------
// Zod specific error handling - may remove later
// --------------------------------------------------------------------------

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
 * @returns A restructured object with simplified error access
 */
export function restructureZodErrors(treeError: any): Record<string, any> {
    let result: Record<string, any> = {};
    
    // -------------------------------------------------------------------------
    // Handle current item errors
    // -------------------------------------------------------------------------
    if (treeError.properties) {
        Object.entries(treeError.properties).forEach(([key, value]) => {
            result[key] = restructureZodErrors(value);
        });
    }
    
    // -------------------------------------------------------------------------
    // Handle nested item errors
    // -------------------------------------------------------------------------
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
    
    return result;
}

export function handleValidationErrors(error: unknown): Record<string, any> {
    if (error instanceof z.ZodError) {
        const tree = z.treeifyError(error);
        return restructureZodErrors(tree);
    } 
    
    if (error && typeof error === 'object' && 'issues' in error) {
        return convertStandardSchemaErrors((error as any).issues);
    }
    
    return { error: 'Unknown validation error' };
}

