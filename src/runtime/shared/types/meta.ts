export type MetaField = {
    isDirty$: boolean;
    isValid$: boolean;
};


// This ensures the meta state object is type-safe
export type MetaStateType<T> = T extends any ? (
    T extends (infer U)[] ? {
            isDirty$: boolean;
            isValid$: boolean;
        } & { items: MetaStateType<U>[] } :
    T extends object ? {
            isDirty$: boolean;
            isValid$: boolean;
        } & { [K in keyof T]: MetaStateType<T[K]> } : {
            isDirty$: boolean;
            isValid$: boolean;
    }
) : never;