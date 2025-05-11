import * as z from '@zod/core';
import { handleZodSchemaValidationErrors } from './errors';


export function handleZodValidate(schema: z.$ZodAny, state: z.infer<typeof schema>): z.infer<typeof schema> | Record<string, string> {
    try {
        //@ts-ignore
        return schema.parse(state);
    }
    catch (error) {
        if (error instanceof z.$ZodError) {
            return handleZodSchemaValidationErrors(error);
        }

        throw error;
    }
}