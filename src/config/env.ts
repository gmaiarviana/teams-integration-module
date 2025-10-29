import { z } from "zod";
import * as dotenv from "dotenv";

// Load env vars from .env if present (local/dev)
dotenv.config();

const envSchema = z.object({
  TEAMS_BOT_ID: z.string().min(1, "TEAMS_BOT_ID é obrigatório"),
  TEAMS_BOT_MANAGED_IDENTITY_CLIENT_ID: z
    .string()
    .min(1, "TEAMS_BOT_MANAGED_IDENTITY_CLIENT_ID é obrigatório"),
  API_KEY: z.string().min(16, "API_KEY deve possuir ao menos 16 caracteres"),
  PORT: z
    .string()
    .optional()
    .transform((val) => (val && /^\d+$/.test(val) ? Number(val) : 3000))
    .pipe(z.number().int().positive()),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const formatted = parsed.error.errors
    .map((e) => `- ${e.path.join(".")}: ${e.message}`)
    .join("\n");
  throw new Error(
    `Falha na validação das variáveis de ambiente:\n${formatted}`
  );
}

export const env = {
  TEAMS_BOT_ID: parsed.data.TEAMS_BOT_ID,
  TEAMS_BOT_MANAGED_IDENTITY_CLIENT_ID:
    parsed.data.TEAMS_BOT_MANAGED_IDENTITY_CLIENT_ID,
  API_KEY: parsed.data.API_KEY,
  PORT: parsed.data.PORT,
};


