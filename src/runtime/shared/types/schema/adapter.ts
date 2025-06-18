import type { DefaultValueGenerationOptions } from '../../types/defaults';
import type { SchemaType, InferSchemaInputType } from '../../types/schema';


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
     * Handle validation and return a consistent format
     */
    syncArraysWithMetaState(metaState: any, state: InferSchemaInputType<SchemaType>, schema: SchemaType, options?: DefaultValueGenerationOptions): any;

    /**
     * Handle validation errors and return a consistent format
     */
    handleValidate<TSchema extends SchemaType>(schema: SchemaType | Partial<InferSchemaInputType<TSchema>>, state: InferSchemaInputType<SchemaType>): T | any;

    /**
     * Handle validation errors and return a consistent format
     */
    handleValidationErrors(state: InferSchemaInputType<SchemaType>): any;

    
    



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