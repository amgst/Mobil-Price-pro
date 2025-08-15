import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Brands API
  app.get("/api/brands", async (req, res) => {
    try {
      const brands = await storage.getAllBrands();
      res.json(brands);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch brands" });
    }
  });

  app.get("/api/brands/:slug", async (req, res) => {
    try {
      const brand = await storage.getBrandBySlug(req.params.slug);
      if (!brand) {
        return res.status(404).json({ message: "Brand not found" });
      }
      res.json(brand);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch brand" });
    }
  });

  // Mobiles API
  app.get("/api/mobiles", async (req, res) => {
    try {
      const { brand, featured, search } = req.query;
      
      let mobiles;
      if (brand) {
        mobiles = await storage.getMobilesByBrand(brand as string);
      } else if (featured === "true") {
        mobiles = await storage.getFeaturedMobiles();
      } else if (search) {
        mobiles = await storage.searchMobiles(search as string);
      } else {
        mobiles = await storage.getAllMobiles();
      }
      
      res.json(mobiles);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch mobiles" });
    }
  });

  app.get("/api/mobiles/:brand/:slug", async (req, res) => {
    try {
      const mobile = await storage.getMobileBySlug(req.params.brand, req.params.slug);
      if (!mobile) {
        return res.status(404).json({ message: "Mobile not found" });
      }
      res.json(mobile);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch mobile" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
