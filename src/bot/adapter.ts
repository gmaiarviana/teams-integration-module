import { BotFrameworkAdapter, TurnContext } from "botbuilder";
import { MicrosoftAppCredentials } from "botframework-connector";
import { DefaultAzureCredential } from "@azure/identity";
import { env } from "../config/env";

// Preparação para Managed Identity (usado em contextos de saída/proativos)
// Mantemos a credencial pronta para cenários que requeiram token AAD.
const managedIdentityCredential = new DefaultAzureCredential();

export const adapter = new BotFrameworkAdapter({
  appId: env.TEAMS_BOT_ID,
  // Em Managed Identity, não utilizamos appPassword localmente;
  // quando necessário, o token AAD é obtido via credencial MI.
  appPassword: env.TEAMS_BOT_PASSWORD,
});

// Logs de inicialização do adapter
const timestamp = new Date().toISOString();
console.log(`[bot][adapter][${timestamp}] TEAMS_BOT_ID: ${env.TEAMS_BOT_ID}`);
console.log(`[bot][adapter][${timestamp}] TEAMS_BOT_PASSWORD: ${env.TEAMS_BOT_PASSWORD ? `existe (${env.TEAMS_BOT_PASSWORD.length} caracteres)` : "não definido"}`);

adapter.onTurnError = async (context: TurnContext, error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  const timestamp = new Date().toISOString();
  // Log básico estruturado
  console.error(`[bot][error][${timestamp}]`, message);
  try {
    // Garantir que o serviceUrl seja confiável antes de tentar enviar mensagem de erro
    if (context.activity.serviceUrl) {
      MicrosoftAppCredentials.trustServiceUrl(context.activity.serviceUrl);
    }
    await context.sendActivity(
      "Desculpe, ocorreu um erro no bot. Tente novamente mais tarde."
    );
  } catch {
    // Evitar lançar erro no handler
  }
};

export { managedIdentityCredential };


