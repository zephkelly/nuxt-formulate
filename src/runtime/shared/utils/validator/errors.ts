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
            // return convertStandardSchemaErrors(error as StandardSchemaV1.Issue[]);

            return error as Record<string, any>;
        }
    }

    return { error: 'Unknown validation error' };
}



// WIP

// export interface ConvertErrorsOptions {
//     /**
//      * Whether to bubble up error messages from child properties to parent objects
//      * @default false
//      */
//     bubbleUp?: boolean;
// }

// export function convertStandardSchemaErrors(
//     issues: ReadonlyArray<StandardSchemaV1.Issue>,
//     options: ConvertErrorsOptions = {}
// ): Record<string, any> {
//     const { bubbleUp = false } = options;
//     const result: Record<string, any> = {};
    
//     // Track all errors by path for building the arrays
//     const errorsByPath: Record<string, string[]> = {};
    
//     for (const issue of issues) {
//         if (!issue.path || issue.path.length === 0) {
//             // Top-level error
//             if (!result.error) result.error = issue.message;
            
//             // Add to root errors array
//             if (!errorsByPath['']) errorsByPath[''] = [];
//             errorsByPath[''].push(issue.message);
//             continue;
//         }
        
//         // Process each part of the path to track errors at each level
//         const pathSegments = issue.path.map(segment => 
//             typeof segment === 'object' && segment !== null
//                 ? String(segment.key)
//                 : String(segment)
//         );
        
//         // Register the error at each level of nesting
//         for (let i = 1; i <= pathSegments.length; i++) {
//             const partialPath = pathSegments.slice(0, i).join('.');
//             if (!errorsByPath[partialPath]) errorsByPath[partialPath] = [];
            
//             // For the leaf level, always add the error message
//             if (i === pathSegments.length) {
//                 errorsByPath[partialPath].push(issue.message);
//             } 
//             // For parent levels, only add if bubbleUp is true
//             else if (bubbleUp) {
//                 errorsByPath[partialPath].push(
//                     `${pathSegments.slice(i).join('.')}: ${issue.message}`
//                 );
//             }
//         }
        
//         // Build the nested structure as before
//         let current = result;
//         for (let i = 0; i < issue.path.length - 1; i++) {
//             const segment = issue.path[i] as StandardSchemaV1.PathSegment;
//             if (!segment) continue;
//             const key = typeof segment === 'object' && segment !== null
//                 ? String(segment.key)
//                 : String(segment);
            
//             if (!current[key]) current[key] = {};
//             current = current[key];
//         }
        
//         const lastSegment = issue.path[issue.path.length - 1];
//         const lastKey = typeof lastSegment === 'object' && lastSegment !== null
//             ? String(lastSegment.key)
//             : String(lastSegment);
        
//         // Set the primary error message (first one encountered)
//         if (!current[lastKey]) {
//             current[lastKey] = issue.message;
//         }
//     }
    
//     // Add error arrays to each path
//     for (const [path, errors] of Object.entries(errorsByPath)) {
//         if (path === '') {
//             // Root level errors
//             result.errors = errors;
//             continue;
//         }
        
//         const pathParts = path.split('.');
//         let current = result;
        
//         // Navigate to the correct nested object
//         for (let i = 0; i < pathParts.length - 1; i++) {
//             const part = pathParts[i];
//             if (!current[part]) current[part] = {};
//             current = current[part];
//         }
        
//         const lastPart = pathParts[pathParts.length - 1];
//         // Add the errors array alongside the field
//         current[`${lastPart}.errors`] = errors;
//     }
    
//     return result;
// }