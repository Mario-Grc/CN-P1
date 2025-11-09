import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';

export const AnimalSchema = z.object({
  animal_id: z.string().uuid().default(uuidv4),
  name: z.string().min(1).max(100),
  species: z.string().min(1).max(100),
  status: z.enum(['available', 'adopted', 'medical', 'reserved']).default('available'),
  size: z.enum(['small', 'medium', 'large']).default('medium'),
  notes: z.string().nullable().optional(),
  
  // Acepta string o Date (por si PostgreSQL devuelve un objeto Date)
  arrival_date: z.union([z.string(), z.date()]).default(() => new Date().toISOString()),
  last_updated: z.union([z.string(), z.date()]).default(() => new Date().toISOString()),

  traits: z.array(z.string()).default([]),
});
