import { adapter } from "./bot/adapter";
import { onConversationUpdate, onMessage } from "./bot/handlers";
import type { Request, Response, NextFunction } from "express";
import type { TurnContext } from "botbuilder";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const express = require("express");

export function createServer() {
  const app = express();

  // Middlewares básicos
  app.use(express.json());

  // Log básico de requisições
  app.use((req: Request, _res: Response, next: NextFunction) => {
    const timestamp = new Date().toISOString();
    console.log(`[http][${timestamp}] ${req.method} ${req.url}`);
    next();
  });

  // Health check
  app.get("/health", (_req: Request, res: Response) => {
    res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Endpoint do Bot Framework
  app.post("/bot/messages", (req: Request, res: Response) => {
    // CloudAdapter usa process(), BotFrameworkAdapter usa processActivity()
    const botHandler = async (context: TurnContext) => {
      await onConversationUpdate(context);
      await onMessage(context);
    };

    if ('process' in adapter) {
      // CloudAdapter (Managed Identity)
      (adapter as any).process(req, res, botHandler);
    } else {
      // BotFrameworkAdapter (Client Secret)
      (adapter as any).processActivity(req, res, botHandler);
    }
  });

  return app;
}
