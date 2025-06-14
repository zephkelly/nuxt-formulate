import type { Ref } from "vue";

import type { SchemaType, InferSchemaType } from "../../shared/types/schema";
import type { IFormulateValidator, SafeValidationResult } from "../../shared/types/validator";

import { FormulateValidator } from "../../shared/utils/validator";
import { unwrapRef } from "../../shared/utils/unwrap-ref";
import { ensureArray } from "../../shared/utils/ensure-array";



export function getValidator<TSchema extends SchemaType>(schema: TSchema): IFormulateValidator<TSchema> {
    const validator = new FormulateValidator<TSchema>(schema);

    return {
        validate: (data: any | Ref<any>): InferSchemaType<TSchema> => {
            return validator.validate(unwrapRef(data));
        },

        validateArray: (data: any[] | Ref<any[]>): InferSchemaType<TSchema>[] => {
            return validator.validateArray(ensureArray(data));
        },

        validatePartial: (data: any | Ref<any>): Partial<InferSchemaType<TSchema>> => {
            return validator.validatePartial(unwrapRef(data));
        },

        validatePartialArray: (data: any[] | Ref<any[]>): Partial<InferSchemaType<TSchema>>[] => {
            return validator.validatePartialArray(ensureArray(data));
        },

        asyncValidate: async (data: any | Ref<any>): Promise<InferSchemaType<TSchema>> => {
            return validator.asyncValidate(unwrapRef(data));
        },

        asyncValidateArray: async (data: any[] | Ref<any[]>): Promise<InferSchemaType<TSchema>[]> => {
            return validator.asyncValidateArray(ensureArray(data));
        },

        asyncValidatePartial: async (data: any | Ref<any>): Promise<Partial<InferSchemaType<TSchema>>> => {
            return validator.asyncValidatePartial(unwrapRef(data));
        },

        asyncValidatePartialArray: async (data: any[] | Ref<any[]>): Promise<Partial<InferSchemaType<TSchema>>[]> => {
            return validator.asyncValidatePartialArray(ensureArray(data));
        },

        safeValidate: (data: any | Ref<any>): SafeValidationResult<InferSchemaType<TSchema>> => {
            return validator.safeValidate(unwrapRef(data));
        },

        safeValidateArray: (data: any[] | Ref<any[]>): SafeValidationResult<InferSchemaType<TSchema>>[] => {
            return validator.safeValidateArray(ensureArray(data));
        },

        safeValidatePartial: (data: any | Ref<any>): SafeValidationResult<Partial<InferSchemaType<TSchema>>> => {
            return validator.safeValidatePartial(unwrapRef(data));
        },

        safeValidatePartialArray: (data: any[] | Ref<any[]>): SafeValidationResult<Partial<InferSchemaType<TSchema>>>[] => {
            return validator.safeValidatePartialArray(ensureArray(data));
        },

        safeAsyncValidate: async (data: any | Ref<any>): Promise<SafeValidationResult<InferSchemaType<TSchema>>> => {
            return validator.safeAsyncValidate(unwrapRef(data));
        },

        safeAsyncValidateArray: async (data: any[] | Ref<any[]>): Promise<SafeValidationResult<InferSchemaType<TSchema>>[]> => {
            return validator.safeAsyncValidateArray(ensureArray(data));
        },

        safeAsyncValidatePartial: async (data: any | Ref<any>): Promise<SafeValidationResult<Partial<InferSchemaType<TSchema>>>> => {
            return validator.safeAsyncValidatePartial(unwrapRef(data));
        },

        safeAsyncValidatePartialArray: async (data: any[] | Ref<any[]>): Promise<SafeValidationResult<Partial<InferSchemaType<TSchema>>>[]> => {
            return validator.safeAsyncValidatePartialArray(ensureArray(data));
        },

        isValidationError: validator.isValidationError.bind(validator),
        isPartialValidationError: validator.isPartialValidationError.bind(validator),

        ValidationError: validator.ValidationError,
        PartialValidationError: validator.PartialValidationError
    };
}