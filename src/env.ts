import { z } from 'zod'

const envSchema = z.object({
  PORT: z.coerce.number().default(3333),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('production'),
  DATABASE_URL: z.string().url().startsWith('postgresql://'),

  CF_ACCOUNT_ID: z.string(),
  CF_ACCESS_KEY_ID: z.string(),
  CF_SECRET_KEY: z.string(),
  CF_BUCKET: z.string(),
  CF_PUBLIC_URL: z.string().url(),
})

export const env = envSchema.parse(process.env)
