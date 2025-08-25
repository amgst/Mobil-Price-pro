import dotenv from "dotenv";
dotenv.config();

import express, { type Request, Response, NextFunction } from "express";
import cookieParser from "cookie-parser";
import { registerRoutes } from "./routes.js";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) logLine = logLine.slice(0, 79) + "…";
      console.log(logLine);
    }
  });

  next();
});

// Error handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  console.error("API Error:", err);
  res.status(status).json({ message });
});

// Initialize routes for both serverless and local development
if (process.env.NETLIFY || process.env.VERCEL) {
  // Serverless environment - just register routes
  registerRoutes(app);
} else {
  // Local development - create server and setup Vite/static serving
  if (import.meta.url === `file://${process.argv[1]}`) {
    (async () => {
      const { setupVite, serveStatic } = await import("./vite.js");
      const server = registerRoutes(app) as any;
      
      if (app.get("env") === "development") {
        await setupVite(app, server);
      } else {
        serveStatic(app);
      }
      
      const port = parseInt(process.env.PORT || "5000");
      server.listen(port, "0.0.0.0", () => {
        console.log(`Server running on port ${port}`);
      });
    })();
  }
}

// Export the app for serverless use
export default app;
