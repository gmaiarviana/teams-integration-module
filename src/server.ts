import { adapter } from "./bot/adapter";
import { onConversationUpdate, onMessage } from "./bot/handlers";
import type { Request, Response, NextFunction } from "express";
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
    adapter.processActivity(req as any, res as any, async (context) => {
      await onConversationUpdate(context);
      await onMessage(context);
    });
  });

  return app;
}
