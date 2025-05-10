import type { DefaultValueGenerationOptions } from '../../types/defaults';



export interface SchemaAdapter<T> {
    /**
     * Create default values based on schema
     * @param schema The schema to create default values for
     * @param options Options for controlling default value generation
     */
    createDefaultValues(schema: T, options?: DefaultValueGenerationOptions): any;
    
    /**
     * Create a partial version of the schema for validation during editing
     */
    createPartialSchema(schema: T): T;
    
    /**
     * Convert validation errors to a consistent format
     */
    handleValidationErrors(error: any): Record<string, any>;
    
    /**
     * Check if a schema is of this adapter's type
     */
    isCompatible(schema: any): boolean;

    /**
     * Check if the adapter supports a specific vendor
     */
    supportsVendor?(vendor: string): boolean;
}

export type AdapterType = 'zod'