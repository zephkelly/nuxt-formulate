/**
 * Creates a debounced function that delays invoking the provided function
 * 
 * @param {Function} func - The function to debounce
 * @param {number} wait - The number of milliseconds to delay
 * @param {boolean} [immediate=false] - Whether to invoke the function at the leading edge of the timeout
 * @returns {Function} - The debounced function
 */
export function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number,
    immediate: boolean = false
): (...args: Parameters<T>) => void {
    let timeout: ReturnType<typeof setTimeout> | null = null;
    
    return function(this: ThisParameterType<T>, ...args: Parameters<T>): void {
        const context = this;
        
        const later = function(): void {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        
        const callNow = immediate && !timeout;
        
        if (timeout) clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        
        if (callNow) func.apply(context, args);
    };
}