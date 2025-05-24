export type ErrorStateType<T> = T extends any ? (
    T extends (infer U)[] ? {
        error?: string;
        items?: ErrorStateType<U>[];
    } :
    T extends object ? {
        error?: string;
    } & { [K in keyof T]?: ErrorStateType<T[K]> } : string
) : never;