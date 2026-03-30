import express from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "../server/_core/oauth";
import { registerOAuthExchangeRoutes } from "../server/_core/oauthExchange";
import { registerEmailAuthRoutes } from "../server/_core/emailAuth";
import { appRouter } from "../server/routers";
import { createContext } from "../server/_core/context";
import { serveStatic } from "../server/_core/vite";

const app = express();

// Configure body parser
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// OAuth callback (Manus platform)
registerOAuthRoutes(app);

// OAuth exchange for third-party providers
registerOAuthExchangeRoutes(app);

// Email-based auth (signup / login)
registerEmailAuthRoutes(app);

// tRPC API
app.use(
  "/api/trpc",
  createExpressMiddleware({
    router: appRouter,
    createContext,
  })
);

// In production, serve static files
if (process.env.NODE_ENV === "production") {
  serveStatic(app);
}

export default app;
