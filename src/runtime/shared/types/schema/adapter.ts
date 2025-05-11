import type { DefaultValueGenerationOptions } from '../../types/defaults';
import type { SchemaType, InferSchemaType } from '../../types/schema';


export interface SchemaAdapter<T> {
    /**
     * Create default values based on schema
     * @param schema The schema to create default values for
     * @param options Options for controlling default value generation
     */
    createDefaultValues(schema: SchemaType, options?: DefaultValueGenerationOptions): any;
    
    /**
     * Create a partial version of the schema for validation during editing
     */
    createPartialSchema(schema: SchemaType): T;

    /**
     * Create a meta object for the schema
     */
    createMetaState(schema: SchemaType, options?: DefaultValueGenerationOptions): any;

    /**
     * Handle validation errors and return a consistent format
     */
    handleValidate(schema: SchemaType, state: InferSchemaType<SchemaType>): T | any;

    /**
     * Handle validation errors and return a consistent format
     */
    handleValidationErrors(state: InferSchemaType<SchemaType>): any;

    
    



    // Used in the adapter registry
    
    /**
     * Check if a schema is of this adapter's type
     */
    isCompatible(schema: SchemaType): boolean;

    /**
     * Check if the adapter supports a specific vendor
     */
    supportsVendor?(vendor: string): boolean;
}

export type AdapterType = 'zod'