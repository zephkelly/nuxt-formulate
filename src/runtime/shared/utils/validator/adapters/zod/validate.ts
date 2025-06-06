import * as z from 'zod/v4/core';
import { handleZodSchemaValidationErrors } from './errors';



export function handleZodValidate(schema: z.$ZodAny, state: z.infer<typeof schema>): z.infer<typeof schema> | Record<string, string> {
    try {
        //@ts-ignore
        return schema.parse(state);
    }
    catch (error) {
        throw handleZodSchemaValidationErrors(error as z.$ZodError);
    }
}