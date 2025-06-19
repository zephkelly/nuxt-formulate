import type { Ref } from 'vue';
import type { SchemaType } from './schema';
import type { ErrorStateType } from './error';
import type { InferSchemaOutputType } from './schema';



export class ValidationError<T = any> extends Error {
    public readonly errors: ErrorStateType<T>;
    public readonly isValidationError = true;
    
    constructor(errors: ErrorStateType<T>, message?: string) {
        super(message || 'Validation failed');
        this.name = 'ValidationError';
        this.errors = errors;
        
        Object.setPrototypeOf(this, ValidationError.prototype);
    }
}

export type SafeValidationResult<T> = {
    success: true;
    data: T;
    errors?: never;
} | {
    success: false;
    data?: never;
    errors: ErrorStateType<T>;
};

export interface IFormulateValidator<TSchema extends SchemaType> {
    validate: (data: any | Ref<any>) => InferSchemaOutputType<TSchema>;
    validateArray: (data: any[] | Ref<any[]>) => InferSchemaOutputType<TSchema>[];
    validatePartial: (data: any | Ref<any>) => Partial<InferSchemaOutputType<TSchema>>;
    validatePartialArray: (data: any[] | Ref<any[]>) => Partial<InferSchemaOutputType<TSchema>>[];
    
    asyncValidate: (data: any | Ref<any>) => Promise<InferSchemaOutputType<TSchema>>;
    asyncValidateArray: (data: any[] | Ref<any[]>) => Promise<InferSchemaOutputType<TSchema>[]>;
    asyncValidatePartial: (data: any | Ref<any>) => Promise<Partial<InferSchemaOutputType<TSchema>>>;
    asyncValidatePartialArray: (data: any[] | Ref<any[]>) => Promise<Partial<InferSchemaOutputType<TSchema>>[]>;

    safeValidate: (data: any | Ref<any>) => SafeValidationResult<InferSchemaOutputType<TSchema>>;
    safeValidateArray: (data: any[] | Ref<any[]>) => SafeValidationResult<InferSchemaOutputType<TSchema>>[];
    safeValidatePartial: (data: any | Ref<any>) => SafeValidationResult<Partial<InferSchemaOutputType<TSchema>>>;
    safeValidatePartialArray: (data: any[] | Ref<any[]>) => SafeValidationResult<Partial<InferSchemaOutputType<TSchema>>>[];
    
    safeAsyncValidate: (data: any | Ref<any>) => Promise<SafeValidationResult<InferSchemaOutputType<TSchema>>>;
    safeAsyncValidateArray: (data: any[] | Ref<any[]>) => Promise<SafeValidationResult<InferSchemaOutputType<TSchema>>[]>;
    safeAsyncValidatePartial: (data: any | Ref<any>) => Promise<SafeValidationResult<Partial<InferSchemaOutputType<TSchema>>>>;
    safeAsyncValidatePartialArray: (data: any[] | Ref<any[]>) => Promise<SafeValidationResult<Partial<InferSchemaOutputType<TSchema>>>[]>;
    
    isValidationError: (error: unknown) => error is ValidationError<InferSchemaOutputType<TSchema>>;
    isPartialValidationError: (error: unknown) => error is ValidationError<Partial<InferSchemaOutputType<TSchema>>>;
    
    ValidationError: typeof ValidationError<InferSchemaOutputType<TSchema>>;
    PartialValidationError: typeof ValidationError<Partial<InferSchemaOutputType<TSchema>>>;
}