import { registerAdapter } from './adapter-registry';
import { ZodAdapter } from './adapters/zod';
import { StandardSchemaAdapter } from './adapters/standard-schema';

// Register adapters
registerAdapter(ZodAdapter);
registerAdapter(StandardSchemaAdapter);


// Export the public API
export { getAdapterForSchema } from './adapter-registry';
export { createDefaultValues } from './defaults';
export { createPartialSchema } from './partial';
export { handleValidationErrors } from './errors';
