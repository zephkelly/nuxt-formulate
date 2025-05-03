import type { StandardSchemaV1 } from '../../../../types/standard-schema/v1';



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