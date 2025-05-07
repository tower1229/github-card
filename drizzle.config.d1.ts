import type { Config } from 'drizzle-kit';

export default {
  schema: './lib/db/schema.ts',
  out: './drizzle/migrations',
  dialect: 'sqlite',
  breakpoints: true,
} satisfies Config;
