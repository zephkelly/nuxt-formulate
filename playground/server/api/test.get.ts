import { z } from "zod/v4";

export default defineEventHandler(async (event) => {
    const testSchema = z.object({
        name: z.string().min(1, "Name is required"),
        age: z.number().int().positive("Age must be a positive integer"),
    })

    const validator = getValidator(testSchema)

    const result = validator.safeValidate({
        name: "John Doe",
        age: 30
    })

    console.log(result)

    if (result.success) {
        return {
            status: "success",
            data: result.data
        }
    }

    return {
        status: "error",
        errors: result.errors
    }
});