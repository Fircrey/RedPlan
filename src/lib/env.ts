import { z } from 'zod'

const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url('NEXT_PUBLIC_SUPABASE_URL must be a valid URL'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, 'NEXT_PUBLIC_SUPABASE_ANON_KEY is required'),
  NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: z.string().min(1, 'NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is required'),
  // Optional server-side keys
  GOOGLE_DIRECTIONS_API_KEY: z.string().optional(),
})

function validateEnv() {
  const result = envSchema.safeParse(process.env)
  if (!result.success) {
    const missing = result.error.issues.map((i) => `  - ${i.path.join('.')}: ${i.message}`)
    console.error(
      `\n❌ Missing or invalid environment variables:\n${missing.join('\n')}\n`,
    )
    throw new Error('Invalid environment variables. See above for details.')
  }
  return result.data
}

export const env = validateEnv()
