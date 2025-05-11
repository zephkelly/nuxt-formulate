export type MetaField = {
    $isTouched: boolean;
    $isDirty: boolean;
    $isValid: boolean;
    $validating: boolean;
};


// This ensures the meta state object is type-safe
export type MetaStateType<T> = T extends any ? (
    T extends (infer U)[] ? {
            $isTouched: boolean;
            $isDirty: boolean;
            $isValid: boolean;
            $validating: boolean;
        } & { items: MetaStateType<U>[] } :
    T extends object ? {
            $isTouched: boolean;
            $isDirty: boolean;
            $isValid: boolean;
            $validating: boolean;
        } & { [K in keyof T]: MetaStateType<T[K]> } : {
        $isTouched: boolean;
        $isDirty: boolean;
        $isValid: boolean;
        $validating: boolean;
    }
) : never;