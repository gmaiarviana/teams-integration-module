import {
  BotFrameworkAdapter,
  CloudAdapter,
  ConfigurationBotFrameworkAuthentication,
  ConfigurationBotFrameworkAuthenticationOptions,
  TurnContext,
} from "botbuilder";
import {
  MicrosoftAppCredentials,
  ManagedIdentityServiceClientCredentialsFactory,
} from "botframework-connector";
import type { IJwtTokenProviderFactory } from "botframework-connector";
import { DefaultAzureCredential, ManagedIdentityCredential } from "@azure/identity";
import { env } from "../config/env";

// Factory simplificada que usa DefaultAzureCredential
// DefaultAzureCredential detecta automaticamente AZURE_CLIENT_ID e AZURE_TENANT_ID das variáveis de ambiente
class DefaultAzureCredentialTokenProviderFactory implements IJwtTokenProviderFactory {
  createAzureServiceTokenProvider(_appId: string): DefaultAzureCredential {
    // DefaultAzureCredential com AZURE_CLIENT_ID e AZURE_TENANT_ID configurados
    // reconhece automaticamente User-Assigned Managed Identity
    return new DefaultAzureCredential();
  }
}

// Preparação para Managed Identity (usado em contextos de saída/proativos)
// Mantemos a credencial pronta para cenários que requeiram token AAD.
const managedIdentityCredential = new DefaultAzureCredential();

// Detectar modo de autenticação
const useManagedIdentity = !env.TEAMS_BOT_PASSWORD;
const timestamp = new Date().toISOString();

console.log(`[bot][adapter][${timestamp}] ================================================`);
console.log(`[bot][adapter][${timestamp}] TEAMS_BOT_ID: ${env.TEAMS_BOT_ID}`);
console.log(`[bot][adapter][${timestamp}] Modo de autenticação: ${useManagedIdentity ? "MANAGED IDENTITY (Azure)" : "CLIENT SECRET (Local/Dev)"}`);

if (useManagedIdentity) {
  console.log(`[bot][adapter][${timestamp}] TEAMS_BOT_MANAGED_IDENTITY_CLIENT_ID: ${env.TEAMS_BOT_MANAGED_IDENTITY_CLIENT_ID}`);
  console.log(`[bot][adapter][${timestamp}] TEAMS_BOT_TENANT_ID: ${env.TEAMS_BOT_TENANT_ID}`);
  console.log(`[bot][adapter][${timestamp}] Usando CloudAdapter com User-Assigned Managed Identity (clientId especificado)`);
} else {
  console.log(`[bot][adapter][${timestamp}] TEAMS_BOT_PASSWORD: existe (${env.TEAMS_BOT_PASSWORD?.length} caracteres)`);
  console.log(`[bot][adapter][${timestamp}] Usando BotFrameworkAdapter com Client Secret`);
}
console.log(`[bot][adapter][${timestamp}] ================================================`);

// Inicialização do adapter com autenticação apropriada
let adapter: BotFrameworkAdapter | CloudAdapter;

if (useManagedIdentity) {
  // Modo Managed Identity: usar CloudAdapter com ConfigurationBotFrameworkAuthentication
  const authConfig: ConfigurationBotFrameworkAuthenticationOptions = {
    MicrosoftAppId: env.TEAMS_BOT_ID,
    MicrosoftAppType: "UserAssignedMSI",
    // MicrosoftAppTenantId deve ser o Tenant ID do Azure AD, não o Client ID da Managed Identity
    MicrosoftAppTenantId: env.TEAMS_BOT_TENANT_ID,
  };

  // Criar factory simplificada que usa DefaultAzureCredential
  // DefaultAzureCredential detecta automaticamente AZURE_CLIENT_ID e AZURE_TENANT_ID das variáveis de ambiente
  const tokenProviderFactory = new DefaultAzureCredentialTokenProviderFactory();
  
  const credentialsFactory = new ManagedIdentityServiceClientCredentialsFactory(
    env.TEAMS_BOT_ID,
    tokenProviderFactory
  );

  const botFrameworkAuthentication = new ConfigurationBotFrameworkAuthentication(
    authConfig,
    credentialsFactory
  );

  adapter = new CloudAdapter(botFrameworkAuthentication);
} else {
  // Modo Client Secret (desenvolvimento): usar BotFrameworkAdapter padrão
  adapter = new BotFrameworkAdapter({
    appId: env.TEAMS_BOT_ID,
    appPassword: env.TEAMS_BOT_PASSWORD,
  });
}

export { adapter };

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


