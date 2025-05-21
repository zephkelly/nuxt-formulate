import type { DefaultValueGenerationOptions } from '../types/defaults'

import moduleOptions from '#build/formulate-options.mjs'



/**
 * Merges local options   global module options,   local taking precedence
 * 
 * @param localOptions The options provided at the composable level
 * @returns Merged options   local taking precedence over global
 */
export function mergeWithGlobalOptions(
    localOptions?: DefaultValueGenerationOptions
): DefaultValueGenerationOptions {
    //@ts-ignore -- we stringify the options in the build module, so we know this is a valid type
    const globalOptions: DefaultValueGenerationOptions = moduleOptions.defaultValueOptions || {}
    
    if (!localOptions) {
        return globalOptions
    }
    
    const result: DefaultValueGenerationOptions = { ...globalOptions }
    
    if (localOptions.primitives !== undefined) {
        result.primitives = localOptions.primitives
    }
    
    if (localOptions.arrays !== undefined) {
        result.arrays = localOptions.arrays
    }
    
    return result
}