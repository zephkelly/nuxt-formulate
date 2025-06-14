import { type Ref } from "vue";
import { createPartialSchema, handleValidate } from "../../shared/utils/validator";
import type { SchemaType, InferSchemaType } from '../../shared/types/schema';


export type ErrorStateType<T> = T extends any ? (
    T extends (infer U)[] ? {
        error?: string;
        items?: ErrorStateType<U>[];
    } :
    T extends object ? {
        error?: string;
    } & { [K in keyof T]?: ErrorStateType<T[K]> } : string
) : never;

export type SafeValidationResult<T> = {
    success: true;
    data: T;
    errors?: never;
} | {
    success: false;
    data?: never;
    errors: ErrorStateType<T>;
};

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
        const result = handleValidate(schema, value);
        
        if (result instanceof Promise) {
            throw new Error('Schema validation returned a Promise. Use asyncValidate() for asynchronous validation.');
        }
        
        return result;
    }

    function validateArray(data: any[] | Ref<any[]>): InferSchemaType<TSchema>[] {
        const arrayData = ensureArray(data);
        return arrayData.map(item => validate(item));
    }

    function validatePartial(data: any | Ref<any>): Partial<InferSchemaType<TSchema>> {
        const value = unwrapRef(data);
        const result = handleValidate(partialSchema, value);
        
        if (result instanceof Promise) {
            throw new Error('Schema validation returned a Promise. Use asyncValidatePartial() for asynchronous validation.');
        }
        
        return result;
    }

    function validatePartialArray(data: any[] | Ref<any[]>): Partial<InferSchemaType<TSchema>>[] {
        const arrayData = ensureArray(data);
        return arrayData.map(item => validatePartial(item));
    }

    async function asyncValidate(data: any | Ref<any>): Promise<InferSchemaType<TSchema>> {
        const value = unwrapRef(data);
        const result = handleValidate(schema, value);
        
        if (result instanceof Promise) {
            return await result;
        }
        
        return result;
    }

    async function asyncValidateArray(data: any[] | Ref<any[]>): Promise<InferSchemaType<TSchema>[]> {
        const arrayData = ensureArray(data);
        const results = await Promise.all(arrayData.map(item => asyncValidate(item)));
        return results;
    }

    async function asyncValidatePartial(data: any | Ref<any>): Promise<Partial<InferSchemaType<TSchema>>> {
        const value = unwrapRef(data);
        const result = handleValidate(partialSchema, value);
        
        if (result instanceof Promise) {
            return await result;
        }
        
        return result;
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
        catch (errors) {
            return {
                success: false,
                errors: errors as ErrorStateType<InferSchemaType<TSchema>>
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
        catch (errors) {
            return {
                success: false,
                errors: errors as ErrorStateType<Partial<InferSchemaType<TSchema>>>
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
        catch (errors) {
            return {
                success: false,
                errors: errors as ErrorStateType<InferSchemaType<TSchema>>
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
        catch (errors) {
            return {
                success: false,
                errors: errors as ErrorStateType<Partial<InferSchemaType<TSchema>>>
            };
        }
    }

    async function safeAsyncValidatePartialArray(data: any[] | Ref<any[]>): Promise<SafeValidationResult<Partial<InferSchemaType<TSchema>>>[]> {
        const arrayData = ensureArray(data);
        const results = await Promise.all(arrayData.map(item => safeAsyncValidatePartial(item)));
        return results;
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
        safeAsyncValidatePartialArray
    };
}