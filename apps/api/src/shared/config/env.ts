import { z } from 'zod';

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(4000),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  POKEAPI_BASE_URL: z.string().url().default('https://pokeapi.co/api/v2'),
  CACHE_TTL_SECONDS: z.coerce.number().int().positive().default(3600),
  ALLOWED_CORS_ORIGINS: z.string().default('http://localhost:3000'),
});

export const env = envSchema.parse(process.env);

export const allowedCorsOrigins = env.ALLOWED_CORS_ORIGINS.split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);
