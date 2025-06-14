import { type Ref } from "vue";

import type { SchemaType, InferSchemaType } from '../../shared/types/schema';
import type { ErrorStateType } from '../../shared/types/error';

import { createPartialSchema, handleValidate } from "../../shared/utils/core";

import { ValidationError, type SafeValidationResult } from "../../shared/types/validation-result";



export interface Validator<TSchema extends SchemaType> {
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

function unwrapRef<T>(data: T | Ref<T>): T {
    return (data as Ref<T>)?.value !== undefined ? (data as Ref<T>).value : (data as T);
}

function ensureArray<T>(data: T[] | Ref<T[]>): T[] {
    const arrayData = unwrapRef(data);
    if (!Array.isArray(arrayData)) {
        throw new Error("Expected an array of data to validate.");
    }
    return arrayData;
}

export function useValidator<TSchema extends SchemaType>(schema: TSchema): Validator<TSchema> {
    const partialSchema = createPartialSchema(schema);

    function validate(data: any | Ref<any>): InferSchemaType<TSchema> {
        const value = unwrapRef(data);
        
        try {
            const result = handleValidate(schema, value);
            
            if (result instanceof Promise) {
                throw new Error('Schema validation returned a Promise. Use asyncValidate() for asynchronous validation.');
            }
            
            return result;
        }
        catch (error) {
            if (error instanceof ValidationError) {
                throw error;
            }
            throw new ValidationError<InferSchemaType<TSchema>>(error as ErrorStateType<InferSchemaType<TSchema>>);
        }
    }

    function validateArray(data: any[] | Ref<any[]>): InferSchemaType<TSchema>[] {
        const arrayData = ensureArray(data);
        return arrayData.map(item => validate(item));
    }

    function validatePartial(data: any | Ref<any>): Partial<InferSchemaType<TSchema>> {
        const value = unwrapRef(data);
        
        try {
            const result = handleValidate(partialSchema, value);
            
            if (result instanceof Promise) {
                throw new Error('Schema validation returned a Promise. Use asyncValidatePartial() for asynchronous validation.');
            }
            
            return result;
        }
        catch (error) {
            if (error instanceof ValidationError) {
                throw error;
            }
            throw new ValidationError<Partial<InferSchemaType<TSchema>>>(error as ErrorStateType<Partial<InferSchemaType<TSchema>>>);
        }
    }

    function validatePartialArray(data: any[] | Ref<any[]>): Partial<InferSchemaType<TSchema>>[] {
        const arrayData = ensureArray(data);
        return arrayData.map(item => validatePartial(item));
    }

    async function asyncValidate(data: any | Ref<any>): Promise<InferSchemaType<TSchema>> {
        const value = unwrapRef(data);
        
        try {
            const result = handleValidate(schema, value);
            
            if (result instanceof Promise) {
                return await result;
            }
            
            return result;
        }
        catch (error) {
            if (error instanceof ValidationError) {
                throw error;
            }

            throw new ValidationError<InferSchemaType<TSchema>>(error as ErrorStateType<InferSchemaType<TSchema>>);
        }
    }

    async function asyncValidateArray(data: any[] | Ref<any[]>): Promise<InferSchemaType<TSchema>[]> {
        const arrayData = ensureArray(data);
        const results = await Promise.all(arrayData.map(item => asyncValidate(item)));
        return results;
    }

    async function asyncValidatePartial(data: any | Ref<any>): Promise<Partial<InferSchemaType<TSchema>>> {
        const value = unwrapRef(data);
        
        try {
            const result = handleValidate(partialSchema, value);
            
            if (result instanceof Promise) {
                return await result;
            }
            
            return result;
        }
        catch (error) {
            if (error instanceof ValidationError) {
                throw error;
            }
            throw new ValidationError<Partial<InferSchemaType<TSchema>>>(error as ErrorStateType<Partial<InferSchemaType<TSchema>>>);
        }
    }

    async function asyncValidatePartialArray(data: any[] | Ref<any[]>): Promise<Partial<InferSchemaType<TSchema>>[]> {
        const arrayData = ensureArray(data);
        const results = await Promise.all(arrayData.map(item => asyncValidatePartial(item)));
        return results;
    }

    function safeValidate(data: any | Ref<any>): SafeValidationResult<InferSchemaType<TSchema>> {
        try {
            const result = validate(data);
            return {
                success: true,
                data: result
            };
        }
        catch (error) {
            const errorState = error instanceof ValidationError 
                ? error.errors as ErrorStateType<InferSchemaType<TSchema>>
                : error as ErrorStateType<InferSchemaType<TSchema>>;
            return {
                success: false,
                errors: errorState
            };
        }
    }

    function safeValidateArray(data: any[] | Ref<any[]>): SafeValidationResult<InferSchemaType<TSchema>>[] {
        const arrayData = ensureArray(data);
        return arrayData.map(item => safeValidate(item));
    }

    function safeValidatePartial(data: any | Ref<any>): SafeValidationResult<Partial<InferSchemaType<TSchema>>> {
        try {
            const result = validatePartial(data);
            return {
                success: true,
                data: result
            };
        }
        catch (error) {
            const errorState = error instanceof ValidationError 
                ? error.errors as ErrorStateType<Partial<InferSchemaType<TSchema>>>
                : error as ErrorStateType<Partial<InferSchemaType<TSchema>>>;
            return {
                success: false,
                errors: errorState
            };
        }
    }

    function safeValidatePartialArray(data: any[] | Ref<any[]>): SafeValidationResult<Partial<InferSchemaType<TSchema>>>[] {
        const arrayData = ensureArray(data);
        return arrayData.map(item => safeValidatePartial(item));
    }

    async function safeAsyncValidate(data: any | Ref<any>): Promise<SafeValidationResult<InferSchemaType<TSchema>>> {
        try {
            const result = await asyncValidate(data);
            return {
                success: true,
                data: result
            };
        }
        catch (error) {
            const errorState = error instanceof ValidationError 
                ? error.errors as ErrorStateType<InferSchemaType<TSchema>>
                : error as ErrorStateType<InferSchemaType<TSchema>>;
            return {
                success: false,
                errors: errorState
            };
        }
    }

    async function safeAsyncValidateArray(data: any[] | Ref<any[]>): Promise<SafeValidationResult<InferSchemaType<TSchema>>[]> {
        const arrayData = ensureArray(data);
        const results = await Promise.all(arrayData.map(item => safeAsyncValidate(item)));
        return results;
    }

    async function safeAsyncValidatePartial(data: any | Ref<any>): Promise<SafeValidationResult<Partial<InferSchemaType<TSchema>>>> {
        try {
            const result = await asyncValidatePartial(data);
            return {
                success: true,
                data: result
            };
        }
        catch (error) {
            const errorState = error instanceof ValidationError 
                ? error.errors as ErrorStateType<Partial<InferSchemaType<TSchema>>>
                : error as ErrorStateType<Partial<InferSchemaType<TSchema>>>;
            return {
                success: false,
                errors: errorState
            };
        }
    }

    async function safeAsyncValidatePartialArray(data: any[] | Ref<any[]>): Promise<SafeValidationResult<Partial<InferSchemaType<TSchema>>>[]> {
        const arrayData = ensureArray(data);
        const results = await Promise.all(arrayData.map(item => safeAsyncValidatePartial(item)));
        return results;
    }

    function isValidationError(error: unknown): error is ValidationError<InferSchemaType<TSchema>> {
        return error instanceof ValidationError;
    }

    function isPartialValidationError(error: unknown): error is ValidationError<Partial<InferSchemaType<TSchema>>> {
        return error instanceof ValidationError;
    }

    return {
        validate,
        validateArray,
        validatePartial,
        validatePartialArray,
        
        asyncValidate,
        asyncValidateArray,
        asyncValidatePartial,
        asyncValidatePartialArray,

        safeValidate,
        safeValidateArray,
        safeValidatePartial,
        safeValidatePartialArray,
        
        safeAsyncValidate,
        safeAsyncValidateArray,
        safeAsyncValidatePartial,
        safeAsyncValidatePartialArray,

        isValidationError,
        isPartialValidationError,

        ValidationError: ValidationError as typeof ValidationError<InferSchemaType<TSchema>>,
        PartialValidationError: ValidationError as typeof ValidationError<Partial<InferSchemaType<TSchema>>>
    };
}