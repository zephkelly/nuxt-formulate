// utils/errors.ts
import type { StandardSchemaV1 } from '../types/standard-schema';
import * as z from 'zod';
import type { ZodTreeError, restructureZodErrors } from './validator/flatten';

export type ErrorsFromSchema<T> = {
    [K in keyof T]?: T[K] extends object ? ErrorsFromSchema<T[K]> : string;
};

// Convert StandardSchema errors to our error format
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
            const segment = issue.path[i];
            const key = typeof segment === 'object' ? segment.key : segment;
            
            if (!current[key]) current[key] = {};
            current = current[key];
        }
        
        const lastSegment = issue.path[issue.path.length - 1];
        const lastKey = typeof lastSegment === 'object' ? lastSegment.key : lastSegment;
        current[lastKey] = issue.message;
    }
    
    return result;
}

// Unified function to handle errors from any schema
export function handleValidationErrors(error: unknown): Record<string, any> {
    if (error instanceof z.ZodError) {
        const tree = z.treeifyError(error);
        return restructureZodErrors(tree);
    } 
    
    if (error && typeof error === 'object' && 'issues' in error) {
        // Handle StandardSchema errors
        return convertStandardSchemaErrors((error as any).issues);
    }
    
    return { error: 'Unknown validation error' };
}