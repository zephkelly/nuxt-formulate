import type { ErrorStateType } from '../../shared/types/error';



export class ValidationError<T = any> extends Error {
    public readonly errors: ErrorStateType<T>;
    public readonly isValidationError = true;
    
    constructor(errors: ErrorStateType<T>, message?: string) {
        super(message || 'Validation failed');
        this.name = 'ValidationError';
        this.errors = errors;
        
        Object.setPrototypeOf(this, ValidationError.prototype);
    }
}

export type SafeValidationResult<T> = {
    success: true;
    data: T;
    errors?: never;
} | {
    success: false;
    data?: never;
    errors: ErrorStateType<T>;
};