import { z } from "zod/v4";


export const testSchema = z.object({
    name: z.string().min(1, { message: "Name is required" }),
    age: z.number().int().positive({ message: "Age must be a positive integer" }),
});



// example of simple union
export const simpleUnionSchema = z.union([
    z.string(),
    z.number(),
    z.boolean(),
]);


//example of simpple discriminated union
export const discriminatedUnionSchema = z.discriminatedUnion("type", [
    z.object({
        type: z.literal("text"),
        content: z.string(),
    }), 
    z.object({
        type: z.literal("number"),
        content: z.number(),
    }),
]);

//mock data for validation checks
export const mockSimpleUnionData = [
    "Hello, world!",
    42,
    true,
];

export const mockDiscriminatedUnionData = [
    { type: "text", content: "This is a text message." },
    { type: "number", content: 12345 },
    { type: "text", content: "Another text message." },
];

export const DiscriminatedUnionValidator = getValidator(discriminatedUnionSchema);