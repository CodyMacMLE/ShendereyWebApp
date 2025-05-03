require('dotenv').config();
import type { Config } from 'drizzle-kit'

export default {
  schema: './lib/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    host: process.env.DB_HOST!,
    database: process.env.DB_NAME!,
    user: process.env.DB_USER!,
    password: process.env.DB_PASSWORD!,
    ssl: {
      rejectUnauthorized: false,
    },
  },
} satisfies Config