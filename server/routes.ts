import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertBrandSchema, insertMobileSchema } from "@shared/schema";
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

  app.post("/api/admin/brands", async (req, res) => {
    try {
      const brandData = insertBrandSchema.parse(req.body);
      const brand = await storage.createBrand(brandData);
      res.status(201).json(brand);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid brand data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create brand" });
    }
  });

  app.put("/api/admin/brands/:id", async (req, res) => {
    try {
      const brandData = insertBrandSchema.partial().parse(req.body);
      const brand = await storage.updateBrand(req.params.id, brandData);
      res.json(brand);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid brand data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update brand" });
    }
  });

  app.delete("/api/admin/brands/:id", async (req, res) => {
    try {
      await storage.deleteBrand(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete brand" });
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

  app.get("/api/admin/mobiles/:id", async (req, res) => {
    try {
      const mobile = await storage.getMobileById(req.params.id);
      if (!mobile) {
        return res.status(404).json({ message: "Mobile not found" });
      }
      res.json(mobile);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch mobile" });
    }
  });

  app.post("/api/admin/mobiles", async (req, res) => {
    try {
      const mobileData = insertMobileSchema.parse(req.body);
      const mobile = await storage.createMobile(mobileData);
      res.status(201).json(mobile);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid mobile data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create mobile" });
    }
  });

  app.put("/api/admin/mobiles/:id", async (req, res) => {
    try {
      const mobileData = insertMobileSchema.partial().parse(req.body);
      const mobile = await storage.updateMobile(req.params.id, mobileData);
      res.json(mobile);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid mobile data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update mobile" });
    }
  });

  app.delete("/api/admin/mobiles/:id", async (req, res) => {
    try {
      await storage.deleteMobile(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete mobile" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
