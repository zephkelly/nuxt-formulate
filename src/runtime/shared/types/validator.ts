import type { Ref } from 'vue';
import type { SchemaType } from './schema';
import type { ErrorStateType } from './error';
import type { InferSchemaType } from './schema';



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
    validate: (data: any | Ref<any>) => InferSchemaType<TSchema>;
    validateArray: (data: any[] | Ref<any[]>) => InferSchemaType<TSchema>[];
    validatePartial: (data: any | Ref<any>) => Partial<InferSchemaType<TSchema>>;
    validatePartialArray: (data: any[] | Ref<any[]>) => Partial<InferSchemaType<TSchema>>[];
    
    asyncValidate: (data: any | Ref<any>) => Promise<InferSchemaType<TSchema>>;
    asyncValidateArray: (data: any[] | Ref<any[]>) => Promise<InferSchemaType<TSchema>[]>;
    asyncValidatePartial: (data: any | Ref<any>) => Promise<Partial<InferSchemaType<TSchema>>>;
    asyncValidatePartialArray: (data: any[] | Ref<any[]>) => Promise<Partial<InferSchemaType<TSchema>>[]>;

    safeValidate: (data: any | Ref<any>) => SafeValidationResult<InferSchemaType<TSchema>>;
    safeValidateArray: (data: any[] | Ref<any[]>) => SafeValidationResult<InferSchemaType<TSchema>>[];
    safeValidatePartial: (data: any | Ref<any>) => SafeValidationResult<Partial<InferSchemaType<TSchema>>>;
    safeValidatePartialArray: (data: any[] | Ref<any[]>) => SafeValidationResult<Partial<InferSchemaType<TSchema>>>[];
    
    safeAsyncValidate: (data: any | Ref<any>) => Promise<SafeValidationResult<InferSchemaType<TSchema>>>;
    safeAsyncValidateArray: (data: any[] | Ref<any[]>) => Promise<SafeValidationResult<InferSchemaType<TSchema>>[]>;
    safeAsyncValidatePartial: (data: any | Ref<any>) => Promise<SafeValidationResult<Partial<InferSchemaType<TSchema>>>>;
    safeAsyncValidatePartialArray: (data: any[] | Ref<any[]>) => Promise<SafeValidationResult<Partial<InferSchemaType<TSchema>>>[]>;
    
    isValidationError: (error: unknown) => error is ValidationError<InferSchemaType<TSchema>>;
    isPartialValidationError: (error: unknown) => error is ValidationError<Partial<InferSchemaType<TSchema>>>;
    
    ValidationError: typeof ValidationError<InferSchemaType<TSchema>>;
    PartialValidationError: typeof ValidationError<Partial<InferSchemaType<TSchema>>>;
}