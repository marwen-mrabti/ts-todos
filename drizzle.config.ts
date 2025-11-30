import { config } from 'dotenv';
import { defineConfig } from 'drizzle-kit';

config();

// In your database config file
const DATABASE_URL =
  process.env.DATABASE_URL ||
  `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`;

export default defineConfig({
  out: './src/db/migrations',
  schema: './src/db/schema',
  dialect: 'postgresql',
  dbCredentials: {
    url: DATABASE_URL,
  },
  migrations: {
    table: 'journal',
    schema: 'drizzle',
  },
  verbose: true,
  strict: true,
});
