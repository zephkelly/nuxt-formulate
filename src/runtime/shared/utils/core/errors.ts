import { getAdapterForSchema } from './adapter-registry';
import type { SchemaType } from '../../types/schema';
import { type StandardSchemaV1 } from '../../types/standard-schema/v1';

import type { InferSchemaType } from '../../types/schema';
import type { ErrorStateType } from '../../types/error';



export function handleValidationErrors<TSchema extends SchemaType>(error: unknown, schema?: SchemaType): ErrorStateType<InferSchemaType<TSchema>> {
    if (schema) {
        const adapter = getAdapterForSchema(schema);

        if (adapter) {
            return adapter.handleValidationErrors(error) as ErrorStateType<InferSchemaType<TSchema>>;
        }
        else {
            console.log(
                '%c FORMULATE ', 'color: black; background-color: #0f8dcc; font-weight: bold; font-size: 1.15rem;',
                '⚠️ Adapter not found for schema, using standard schema error handler'
            );

            return convertStandardSchemaErrors(error as StandardSchemaV1.Issue[])  as ErrorStateType<InferSchemaType<TSchema>>;
        }
    }

    return { error: 'Unknown validation error' } as ErrorStateType<InferSchemaType<TSchema>>;
}



export function convertStandardSchemaErrors<T = unknown>(
    issues: ReadonlyArray<StandardSchemaV1.Issue>
): ErrorStateType<T> {
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
    
    return result as ErrorStateType<T>;
}


export function handleStandardSchemaErrors<T = unknown>(
    error: unknown
): { error: string } | { errors: ErrorStateType<T> } {
    if (error && typeof error === 'object' && 'issues' in error) {
        return { errors: convertStandardSchemaErrors<T>((error as any).issues) };
    }
   
    return { error: 'Unknown validation error' };
}