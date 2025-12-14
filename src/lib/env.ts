import { validateWithPretty } from '@/lib/helpers';
import { z } from 'zod';

/**
 * Environment variable schema using Zod
 * Validates all required environment variables at runtime
 */
const envSchema = z.object({
  // Base URL
  BASE_URL: z
    .url('BASE_URL must be a valid URL')
    .default('http://localhost:3000'),

  // Database Configuration
  DB_HOST: z.string().min(1, 'DB_HOST is required'),
  DB_USER: z.string().min(1, 'DB_USER is required'),
  DB_PASSWORD: z.string().min(1, 'DB_PASSWORD is required'),
  DB_NAME: z.string().min(1, 'DB_NAME is required'),
  DB_PORT: z.coerce
    .number()
    .int()
    .positive('DB_PORT must be a positive integer'),
  DATABASE_URL: z.url('DATABASE_URL must be a valid URL'),

  // Authentication
  BETTER_AUTH_SECRET: z.string().min(1, 'BETTER_AUTH_SECRET is required'),
  AUTH_GITHUB_CLIENT_ID: z.string().optional(),
  AUTH_GITHUB_CLIENT_SECRET: z.string().optional(),

  // Email SMTP Configuration
  SMTP_SERVICE: z.string().min(1, 'SMTP_SERVICE is required'),
  SMTP_HOST: z.string().min(1, 'SMTP_HOST is required'),
  SMTP_PORT: z.coerce
    .number()
    .int()
    .positive('SMTP_PORT must be a positive integer')
    .catch(465),
  SMTP_USER: z.email('SMTP_USER must be a valid email'),
  SMTP_PASSWORD: z.string().min(1, 'SMTP_PASSWORD is required'),

  // Node Environment
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
});

/**
 * Type-safe environment variables
 */
export type Env = z.infer<typeof envSchema>;

export const env = validateWithPretty(envSchema, process.env);
