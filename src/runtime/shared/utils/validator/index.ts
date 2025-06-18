import type { SchemaType, InferSchemaOutputType } from '../../types/schema';
import type { ErrorStateType } from '../../types/error';
import { createPartialSchema, handleValidate } from "../../utils/core";
import { type SafeValidationResult, ValidationError } from "../../types/validator";



export class FormulateValidator<TSchema extends SchemaType> {
    private schema: TSchema;
    private partialSchema: Partial<TSchema> | null;

    constructor(schema: TSchema, options?: {
        partial: TSchema
    }) {
        this.schema = schema;

        if (options?.partial) {
            this.partialSchema = options.partial;
            return;
        }

        this.partialSchema = createPartialSchema(schema);
    }

    checkHasPartialSchema(): boolean {
        return this.partialSchema !== null;
    }

    private ensureArray<T>(data: T[]): T[] {
        if (!Array.isArray(data)) {
            throw new Error("Expected an array of data to validate.");
        }
        return data;
    }

    validate(data: any): InferSchemaOutputType<TSchema> {
        try {
            const result = handleValidate(this.schema, data);
            
            if (result instanceof Promise) {
                throw new Error('Schema validation returned a Promise. Use asyncValidate() for asynchronous validation.');
            }
            
            return result;
        }
        catch (error) {
            if (error instanceof ValidationError) {
                throw error;
            }
            throw new ValidationError<InferSchemaOutputType<TSchema>>(error as ErrorStateType<InferSchemaOutputType<TSchema>>);
        }
    }

    validateArray(data: any[]): InferSchemaOutputType<TSchema>[] {
        const arrayData = this.ensureArray(data);
        return arrayData.map(item => this.validate(item));
    }

    validatePartial(data: any): Partial<InferSchemaOutputType<TSchema>> {
        if (!this.partialSchema) {
            console.warn('Partial schema is not defined for this validator. Ensure the adapter supports partial validation.');
            return data as Partial<InferSchemaOutputType<TSchema>>;
        }
        try {
            const result = handleValidate(this.partialSchema, data);
            
            if (result instanceof Promise) {
                throw new Error('Schema validation returned a Promise. Use asyncValidatePartial() for asynchronous validation.');
            }
            
            return result;
        }
        catch (error) {
            if (error instanceof ValidationError) {
                throw error;
            }
            throw new ValidationError<Partial<InferSchemaOutputType<TSchema>>>(error as ErrorStateType<Partial<InferSchemaOutputType<TSchema>>>);
        }
    }

    validatePartialArray(data: any[]): Partial<InferSchemaOutputType<TSchema>>[] {
        const arrayData = this.ensureArray(data);
        return arrayData.map(item => this.validatePartial(item));
    }

    async asyncValidate(data: any): Promise<InferSchemaOutputType<TSchema>> {
        try {
            const result = handleValidate(this.schema, data);
            
            if (result instanceof Promise) {
                return await result;
            }
            
            return result;
        }
        catch (error) {
            if (error instanceof ValidationError) {
                throw error;
            }
            throw new ValidationError<InferSchemaOutputType<TSchema>>(error as ErrorStateType<InferSchemaOutputType<TSchema>>);
        }
    }

    async asyncValidateArray(data: any[]): Promise<InferSchemaOutputType<TSchema>[]> {
        const arrayData = this.ensureArray(data);
        const results = await Promise.all(arrayData.map(item => this.asyncValidate(item)));
        return results;
    }

    async asyncValidatePartial(data: any): Promise<Partial<InferSchemaOutputType<TSchema>>> {
        if (!this.partialSchema) {
            console.warn('Partial schema is not defined for this validator. Ensure the adapter supports partial validation.');
            return data as Partial<InferSchemaOutputType<TSchema>>;
        }

        try {
            const result = handleValidate(this.partialSchema, data);
            
            if (result instanceof Promise) {
                return await result;
            }
            
            return result;
        }
        catch (error) {
            if (error instanceof ValidationError) {
                throw error;
            }
            throw new ValidationError<Partial<InferSchemaOutputType<TSchema>>>(error as ErrorStateType<Partial<InferSchemaOutputType<TSchema>>>);
        }
    }

    async asyncValidatePartialArray(data: any[]): Promise<Partial<InferSchemaOutputType<TSchema>>[]> {
        const arrayData = this.ensureArray(data);
        const results = await Promise.all(arrayData.map(item => this.asyncValidatePartial(item)));
        return results;
    }

    safeValidate(data: any): SafeValidationResult<InferSchemaOutputType<TSchema>> {
        try {
            const result = this.validate(data);
            return {
                success: true,
                data: result
            };
        }
        catch (error) {
            const errorState = error instanceof ValidationError 
                ? error.errors as ErrorStateType<InferSchemaOutputType<TSchema>>
                : error as ErrorStateType<InferSchemaOutputType<TSchema>>;
            return {
                success: false,
                errors: errorState
            };
        }
    }

    safeValidateArray(data: any[]): SafeValidationResult<InferSchemaOutputType<TSchema>>[] {
        const arrayData = this.ensureArray(data);
        return arrayData.map(item => this.safeValidate(item));
    }

    safeValidatePartial(data: any): SafeValidationResult<Partial<InferSchemaOutputType<TSchema>>> {
        try {
            const result = this.validatePartial(data);
            return {
                success: true,
                data: result
            };
        }
        catch (error) {
            const errorState = error instanceof ValidationError 
                ? error.errors as ErrorStateType<Partial<InferSchemaOutputType<TSchema>>>
                : error as ErrorStateType<Partial<InferSchemaOutputType<TSchema>>>;
            return {
                success: false,
                errors: errorState
            };
        }
    }

    safeValidatePartialArray(data: any[]): SafeValidationResult<Partial<InferSchemaOutputType<TSchema>>>[] {
        const arrayData = this.ensureArray(data);
        return arrayData.map(item => this.safeValidatePartial(item));
    }

    async safeAsyncValidate(data: any): Promise<SafeValidationResult<InferSchemaOutputType<TSchema>>> {
        try {
            const result = await this.asyncValidate(data);
            return {
                success: true,
                data: result
            };
        }
        catch (error) {
            const errorState = error instanceof ValidationError 
                ? error.errors as ErrorStateType<InferSchemaOutputType<TSchema>>
                : error as ErrorStateType<InferSchemaOutputType<TSchema>>;
            return {
                success: false,
                errors: errorState
            };
        }
    }

    async safeAsyncValidateArray(data: any[]): Promise<SafeValidationResult<InferSchemaOutputType<TSchema>>[]> {
        const arrayData = this.ensureArray(data);
        const results = await Promise.all(arrayData.map(item => this.safeAsyncValidate(item)));
        return results;
    }

    async safeAsyncValidatePartial(data: any): Promise<SafeValidationResult<Partial<InferSchemaOutputType<TSchema>>>> {
        try {
            const result = await this.asyncValidatePartial(data);
            return {
                success: true,
                data: result
            };
        }
        catch (error) {
            const errorState = error instanceof ValidationError 
                ? error.errors as ErrorStateType<Partial<InferSchemaOutputType<TSchema>>>
                : error as ErrorStateType<Partial<InferSchemaOutputType<TSchema>>>;
            return {
                success: false,
                errors: errorState
            };
        }
    }

    async safeAsyncValidatePartialArray(data: any[]): Promise<SafeValidationResult<Partial<InferSchemaOutputType<TSchema>>>[]> {
        const arrayData = this.ensureArray(data);
        const results = await Promise.all(arrayData.map(item => this.safeAsyncValidatePartial(item)));
        return results;
    }

    isValidationError(error: unknown): error is ValidationError<InferSchemaOutputType<TSchema>> {
        return error instanceof ValidationError;
    }

    isPartialValidationError(error: unknown): error is ValidationError<Partial<InferSchemaOutputType<TSchema>>> {
        return error instanceof ValidationError;
    }

    get ValidationError() {
        return ValidationError as typeof ValidationError<InferSchemaOutputType<TSchema>>;
    }

    get PartialValidationError() {
        return ValidationError as typeof ValidationError<Partial<InferSchemaOutputType<TSchema>>>;
    }
}