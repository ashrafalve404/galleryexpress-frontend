import { z } from 'zod';

export const passengerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z
    .string()
    .min(11, 'Phone must be at least 11 digits')
    .regex(/^(\+880|880|0)?1[3-9]\d{8}$/, 'Please enter a valid Bangladeshi phone number'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
  nid: z.string().optional(),
  age: z.number().min(1).max(120).optional(),
});

export const multiPassengerSchema = z.object({
  passengers: z.array(passengerSchema).min(1, 'At least one passenger required'),
});

export type PassengerFormData = z.infer<typeof passengerSchema>;
export type MultiPassengerFormData = z.infer<typeof multiPassengerSchema>;
