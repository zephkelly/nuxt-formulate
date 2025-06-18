import type { SchemaType, InferSchemaType } from '../../types/schema';
import type { ErrorStateType } from '../../types/error';
import { createPartialSchema, handleValidate } from "../../utils/core";
import { type IFormulateValidator, type SafeValidationResult, ValidationError } from "../../types/validator";



export class FormulateValidator<TSchema extends SchemaType> {
    private schema: TSchema;
    private partialSchema: any;

    constructor(schema: TSchema) {
        this.schema = schema;

        this.partialSchema = createPartialSchema(schema);

        this.partialSchema.def.options.forEach((option: any) => {
            console.dir(option.shape, { depth: 4, colors: true });
        });

    }

    private ensureArray<T>(data: T[]): T[] {
        if (!Array.isArray(data)) {
            throw new Error("Expected an array of data to validate.");
        }
        return data;
    }

    validate(data: any): InferSchemaType<TSchema> {
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
            throw new ValidationError<InferSchemaType<TSchema>>(error as ErrorStateType<InferSchemaType<TSchema>>);
        }
    }

    validateArray(data: any[]): InferSchemaType<TSchema>[] {
        const arrayData = this.ensureArray(data);
        return arrayData.map(item => this.validate(item));
    }

    validatePartial(data: any): Partial<InferSchemaType<TSchema>> {
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
            throw new ValidationError<Partial<InferSchemaType<TSchema>>>(error as ErrorStateType<Partial<InferSchemaType<TSchema>>>);
        }
    }

    validatePartialArray(data: any[]): Partial<InferSchemaType<TSchema>>[] {
        const arrayData = this.ensureArray(data);
        return arrayData.map(item => this.validatePartial(item));
    }

    async asyncValidate(data: any): Promise<InferSchemaType<TSchema>> {
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
            throw new ValidationError<InferSchemaType<TSchema>>(error as ErrorStateType<InferSchemaType<TSchema>>);
        }
    }

    async asyncValidateArray(data: any[]): Promise<InferSchemaType<TSchema>[]> {
        const arrayData = this.ensureArray(data);
        const results = await Promise.all(arrayData.map(item => this.asyncValidate(item)));
        return results;
    }

    async asyncValidatePartial(data: any): Promise<Partial<InferSchemaType<TSchema>>> {
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
            throw new ValidationError<Partial<InferSchemaType<TSchema>>>(error as ErrorStateType<Partial<InferSchemaType<TSchema>>>);
        }
    }

    async asyncValidatePartialArray(data: any[]): Promise<Partial<InferSchemaType<TSchema>>[]> {
        const arrayData = this.ensureArray(data);
        const results = await Promise.all(arrayData.map(item => this.asyncValidatePartial(item)));
        return results;
    }

    safeValidate(data: any): SafeValidationResult<InferSchemaType<TSchema>> {
        try {
            const result = this.validate(data);
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

    safeValidateArray(data: any[]): SafeValidationResult<InferSchemaType<TSchema>>[] {
        const arrayData = this.ensureArray(data);
        return arrayData.map(item => this.safeValidate(item));
    }

    safeValidatePartial(data: any): SafeValidationResult<Partial<InferSchemaType<TSchema>>> {
        try {
            const result = this.validatePartial(data);
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

    safeValidatePartialArray(data: any[]): SafeValidationResult<Partial<InferSchemaType<TSchema>>>[] {
        const arrayData = this.ensureArray(data);
        return arrayData.map(item => this.safeValidatePartial(item));
    }

    async safeAsyncValidate(data: any): Promise<SafeValidationResult<InferSchemaType<TSchema>>> {
        try {
            const result = await this.asyncValidate(data);
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

    async safeAsyncValidateArray(data: any[]): Promise<SafeValidationResult<InferSchemaType<TSchema>>[]> {
        const arrayData = this.ensureArray(data);
        const results = await Promise.all(arrayData.map(item => this.safeAsyncValidate(item)));
        return results;
    }

    async safeAsyncValidatePartial(data: any): Promise<SafeValidationResult<Partial<InferSchemaType<TSchema>>>> {
        try {
            const result = await this.asyncValidatePartial(data);
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

    async safeAsyncValidatePartialArray(data: any[]): Promise<SafeValidationResult<Partial<InferSchemaType<TSchema>>>[]> {
        const arrayData = this.ensureArray(data);
        const results = await Promise.all(arrayData.map(item => this.safeAsyncValidatePartial(item)));
        return results;
    }

    isValidationError(error: unknown): error is ValidationError<InferSchemaType<TSchema>> {
        return error instanceof ValidationError;
    }

    isPartialValidationError(error: unknown): error is ValidationError<Partial<InferSchemaType<TSchema>>> {
        return error instanceof ValidationError;
    }

    get ValidationError() {
        return ValidationError as typeof ValidationError<InferSchemaType<TSchema>>;
    }

    get PartialValidationError() {
        return ValidationError as typeof ValidationError<Partial<InferSchemaType<TSchema>>>;
    }
}