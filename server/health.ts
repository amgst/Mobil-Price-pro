import type { Express } from "express";

export function registerHealthCheck(app: Express) {
  app.get("/api/health", (req, res) => {
    res.status(200).json({ status: "ok" });
  });
}
