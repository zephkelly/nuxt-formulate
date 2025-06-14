import { type Ref } from 'vue';



export function unwrapRef<T>(data: T | Ref<T>): T {
    return (data as Ref<T>)?.value !== undefined ? (data as Ref<T>).value : (data as T);
}