/**
 * Options for controlling default value generation behavior
 */
export type DefaultValueGenerationOptions = {
    /**
     * Strategy for handling method  out explicit defaults
     */
    method?: 'sensible' | 'undefined' | 'null';
    
    /**
     * Strategy for handling arrays
     */
    arrays?: 'empty' | 'undefined' | 'null' | 'populate' | {
        method: 'empty' | 'undefined' | 'null' | 'populate';
        length?: number;

        depth?: {
            max?: number;
            layers?: number[];
            fallback?: 'empty' | 'undefined' | 'null' | 'populate';
        };
    };
};