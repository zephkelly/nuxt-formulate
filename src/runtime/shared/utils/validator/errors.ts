import { getAdapterForSchema } from './adapter-registry';
import type { SchemaType } from '../../types/schema';
import { type StandardSchemaV1 } from '../../types/standard-schema/v1';


export function handleValidationErrors(error: unknown, schema?: SchemaType): Record<string, any> {
    if (schema) {
        const adapter = getAdapterForSchema(schema);

        if (adapter) {
            return adapter.handleValidationErrors(error);
        }
        // This should never happen, but if it does, we can try to handle it
        // using the standard schema error handler
        else {
            console.log(
                '%c FORMULATE ', 'color: black; background-color: #0f8dcc; font-weight: bold; font-size: 1.15rem;',
                '⚠️ Adapter not found for schema, using standard schema error handler'
            );
            return convertStandardSchemaErrors(error as StandardSchemaV1.Issue[]);
        }
    }

    return { error: 'Unknown validation error' };
}



// If no validator is provided, we use this as a fallback
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


export function handleStandardSchemaErrors(
    error: unknown
): { error: string } | { errors: Record<string, any> } {
    if (error && typeof error === 'object' && 'issues' in error) {
        return { errors: convertStandardSchemaErrors((error as any).issues) };
    }
    
    return { error: 'Unknown validation error' };
}