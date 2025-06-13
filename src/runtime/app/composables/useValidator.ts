import { type Ref } from "vue";
import type { SchemaType } from "../../shared/types/schema";
import { createPartialSchema, handleValidate } from "../../shared/utils/validator";
import { type StandardSchemaV1 } from '../../shared/types/standard-schema/v1';



export interface Validator<TSchema> {
    validate: (data: any) => StandardSchemaV1.Result<unknown> | Promise<StandardSchemaV1.Result<unknown>>;
    validateArray: (data: any[]) => StandardSchemaV1.Result<unknown>[] | Promise<StandardSchemaV1.Result<unknown>[]>;

    validatePartial: (data: any) => StandardSchemaV1.Result<unknown> | Promise<StandardSchemaV1.Result<unknown>>;
    validatePartialArray: (data: any[]) => StandardSchemaV1.Result<unknown>[] | Promise<StandardSchemaV1.Result<unknown>[]>;
}

export function useValidator<TSchema extends SchemaType>(schema: TSchema): Validator<TSchema> {

    const partialSchema = createPartialSchema(schema);

    function validate(data: any | Ref<any>): StandardSchemaV1.Result<unknown> | Promise<StandardSchemaV1.Result<unknown>> {
        if (data.value !== undefined) {
            return handleValidate(schema, data.value);
        }
        return handleValidate(schema, data);
    }

    function validateArray(data: any[] | Ref<any[]>): (StandardSchemaV1.Result<unknown> | Promise<StandardSchemaV1.Result<unknown>>)[] {
        if (!Array.isArray(data)) {
            if (data.value !== undefined) {
                if (data.value.length === 0) {
                    return [];
                }
                if (data.value.length === 1) {
                    return [validate(data.value[0])];
                }
                return data.value.map(item => validate(item));
            }

            throw new Error("Expected an array of data to validate.");
        }

        if (data.length === 0) {
            return [];
        }
        if (data.length === 1) {
            return [validate(data[0])];
        }
        return data.map(item => validate(item));
    }


    function validatePartial(data: any | Ref<any>): any {
        if (data.value !== undefined) {
            return handleValidate(partialSchema, data.value);
        }

        return handleValidate(partialSchema, data);
    }

    function validatePartialArray(data: any[] | Ref<any[]>): (StandardSchemaV1.Result<unknown> | Promise<StandardSchemaV1.Result<unknown>>)[] {
        if (!Array.isArray(data)) {
            if (data.value !== undefined) {
                if (data.value.length === 0) {
                    return [];
                }
                if (data.value.length === 1) {
                    return [validatePartial(data.value[0])];
                }
                return data.value.map(item => validatePartial(item));
            }

            throw new Error("Expected an array of data to validate.");
        }


        if (data.length === 0) {
            return [];
        }
        if (data.length === 1) {
            return [validatePartial(data[0])];
        }
        return data.map(item => validatePartial(item));
    }

    return {
        validate,
        //@ts-ignore
        validateArray,

        validatePartial,
        //@ts-ignore
        validatePartialArray
    };
}