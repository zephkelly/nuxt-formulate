export interface SchemaAdapter<T> {
    /**
     * Create default values based on schema
     */
    createDefaultValues(schema: T): any;
    
    /**
     * Create a partial version of the schema for validation during editing
     */
    createPartialSchema(schema: T): T;
    
    /**
     * Validate values against schema
     * @returns null if validation passes, or error object if it fails
     */
    validate(schema: T, value: any): Promise<null | { issues?: any }>;
    
    /**
     * Convert validation errors to a consistent format
     */
    handleValidationErrors(error: any): Record<string, any>;
    
    /**
     * Check if a schema is of this adapter's type
     */
    isCompatible(schema: any): boolean;
}