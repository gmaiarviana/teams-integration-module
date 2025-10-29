import { BotFrameworkAdapter, TurnContext, ConversationReference, ActivityTypes } from "botbuilder";
import { trustServiceUrl } from "./adapter";

type ConversationKey = string;

export const inMemoryConversationReferences: Map<ConversationKey, Partial<ConversationReference>> = new Map();

export function getTenantId(context: TurnContext): string | undefined {
  const channelData: any = context.activity.channelData as any;
  return channelData?.tenant?.id || (context.activity.conversation as any)?.tenantId;
}

export function getConversationKey(tenantId: string | undefined, userId: string | undefined): ConversationKey | undefined {
  if (!tenantId || !userId) return undefined;
  return `${tenantId}:${userId}`;
}

export function logInfo(event: string, data: Record<string, unknown> = {}): void {
  const timestamp = new Date().toISOString();
  // Log estruturado simples
  console.log(`[bot][info][${timestamp}][${event}]`, JSON.stringify(data));
}

export function registerHandlers(_adapter: BotFrameworkAdapter): void {
  // Este módulo expõe handlers para serem usados no endpoint do bot
  // (o wire acontece no ÉPICO 3 - API). Mantemos somente exports e lógica aqui.
}

export async function onMessage(context: TurnContext): Promise<void> {
  if (context.activity.type !== ActivityTypes.Message) return;
  const tenantId = getTenantId(context);
  const userId = context.activity.from?.id;
  const text = (context.activity.text || "").trim();

  logInfo("message.received", { tenantId, userId, textLength: text.length });

  const reply = text ? `You said: ${text}` : "You said: (no text)";
  await context.sendActivity(reply);
}

export async function onConversationUpdate(context: TurnContext): Promise<void> {
  if (context.activity.type !== ActivityTypes.ConversationUpdate) return;
  const tenantId = getTenantId(context);
  const userId = context.activity.recipient?.id || context.activity.from?.id;

  const reference = TurnContext.getConversationReference(context.activity);
  if (reference.serviceUrl) {
    trustServiceUrl(reference.serviceUrl);
  }

  const key = getConversationKey(tenantId, userId);
  if (key) {
    inMemoryConversationReferences.set(key, reference);
    logInfo("conversation.update.saved", {
      tenantId,
      userId,
      serviceUrl: reference.serviceUrl,
      conversationId: reference.conversation?.id,
    });
  } else {
    logInfo("conversation.update.missing_ids", { tenantId, userId });
  }
}

export function getConversationReference(tenantId: string, userId: string): Partial<ConversationReference> | undefined {
  const key = getConversationKey(tenantId, userId);
  return key ? inMemoryConversationReferences.get(key) : undefined;
}


