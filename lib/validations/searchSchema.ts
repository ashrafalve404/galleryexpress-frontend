import { z } from 'zod';

export const searchSchema = z.object({
  from: z.string().min(2, 'Please select origin city'),
  to: z.string().min(2, 'Please select destination city'),
  date: z.string().min(1, 'Please select a travel date'),
});

export type SearchFormData = z.infer<typeof searchSchema>;
