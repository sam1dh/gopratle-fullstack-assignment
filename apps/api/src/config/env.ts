import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().default(5000),
  MONGODB_URI: z.string().url("MONGODB_URI must be a valid URL"),
  FRONTEND_URL: z.string().url("FRONTEND_URL must be a valid URL").default("http://localhost:3000"),
  GROQ_API_KEY: z.string().optional(),
  GROQ_MODEL: z.string().default("qwen/qwen3.8-27b"),
  GOOGLE_MAPS_API_KEY: z.string().optional(),
  OPENROUTER_API_KEY: z.string().optional(),
  OPENROUTER_MODEL: z.string().default("inclusionai/ling-3.0-flash-sante:free"),
  CARTESIA_API_KEY: z.string().optional(),
  CARTESIA_VOICE_ID: z.string().default("c894559e-d529-4d70-a6fb-3330ecf7ef6b"),
  CARTESIA_VOICE_ID_HI: z.string().default("c6bbc7d5-4b35-4d49-b1c6-4417019a61c1"),
});

export type Env = z.infer<typeof envSchema>;

let _env: Env | null = null;

export function getEnv(): Env {
  if (!_env) {
    const result = envSchema.safeParse(process.env);
    if (!result.success) {
      console.error("Invalid environment variables:");
      console.error(result.error.format());
      process.exit(1);
    }
    _env = result.data;
  }
  return _env;
}

export function resetEnv(): void {
  _env = null;
}
