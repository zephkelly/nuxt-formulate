import * as z from 'zod';

// Define some basic types first
const stringId = z.string().uuid();
const timestamp = z.date();
const positiveNumber = z.number().positive();
const emailAddress = z.string().email();
const phoneRegex = /^\+?[1-9]\d{1,14}$/;
const phoneNumber = z.string().regex(phoneRegex, 'Invalid phone number format');

// Using z.interface() for a User type
const UserInterface = z.interface({
  id: stringId,
  email: emailAddress,
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  age: z.number().int().min(18).optional(),
  phoneNumber: phoneNumber.optional(),
  createdAt: timestamp,
  updatedAt: timestamp,
  isActive: z.boolean().default(true),
  roles: z.array(z.enum(['admin', 'user', 'moderator'])),
  preferences: z.interface({
    theme: z.enum(['light', 'dark', 'system']).default('system'),
    notifications: z.boolean().default(true),
    language: z.enum(['en', 'fr', 'es', 'de']).default('en')
  }),
  metadata: z.record(z.string(), z.unknown()).optional()
});

// Using z.object() for an Address type
export const AddressObject = z.interface({
  street: z.string(),
  city: z.string(),
  state: z.string(),
  zipCode: z.string(),
  country: z.string(),
  isPrimary: z.boolean().default(false),
  validUntil: timestamp.optional()
}).optional();

// Creating a more complex type that combines both
export const UserProfileSchema = z.interface({
  user: UserInterface,
  addresses: z.array(AddressObject),
  billingInfo: z.object({
    paymentMethod: z.enum(['credit_card', 'paypal', 'bank_transfer']),
    billingAddress: AddressObject,
    accountBalance: positiveNumber.default(0),
    transactions: z.array(
      z.object({
        id: stringId,
        amount: z.number(),
        date: timestamp,
        description: z.string(),
        status: z.enum(['pending', 'completed', 'failed', 'refunded'])
      })
    ).default([])
  }).optional(),
  activity: z.array(
    z.interface({
      timestamp: timestamp,
      action: z.string(),
      details: z.record(z.string(), z.unknown()).optional()
    })
  ).default([]),
  settings: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])).optional()
});

// Example of nested arrays and objects
export const TeamSchema = z.interface({
  id: stringId,
  name: z.string(),
  description: z.string().optional(),
  members: z.array(UserInterface),
  projects: z.array(
    z.object({
      id: stringId,
      name: z.string(),
      status: z.enum(['planning', 'active', 'completed', 'archived']),
      tasks: z.array(
        z.interface({
          id: stringId,
          title: z.string(),
          description: z.string().optional(),
          assignedTo: UserInterface.optional(),
          priority: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
          dueDate: timestamp.optional(),
          tags: z.array(z.string()).default([])
        })
      ).default([])
    })
  ).default([])
});

// Type using discriminated unions
export const BaseEventSchema = z.interface({
  id: z.number(),
  timestamp: timestamp,
  actor: UserInterface,
});

export const LoginEvent = BaseEventSchema.extend({
  type: z.literal('login'),
  device: z.string(),
  ipAddress: z.string(),
});

const LogoutEvent = BaseEventSchema.extend({
  type: z.literal('logout'),
  reason: z.enum(['user_initiated', 'session_timeout', 'security_concern']),
});

const PurchaseEvent = BaseEventSchema.extend({
  type: z.literal('purchase'),
  productId: stringId,
  amount: positiveNumber,
  paymentMethod: z.string(),
});

export const EventSchema = z.discriminatedUnion('type', [
  LoginEvent,
  LogoutEvent,
  PurchaseEvent
]);

// Export the types
export type UserInterface = z.infer<typeof UserInterface>;
export type AddressObject = z.infer<typeof AddressObject>;
export type UserProfile = z.infer<typeof UserProfileSchema>;
export type Team = z.infer<typeof TeamSchema>;
export type Event = z.infer<typeof EventSchema>;

// Export the schemas
export {
  UserInterface as UserInterfaceSchema,
  AddressObject as AddressObjectSchema,
};