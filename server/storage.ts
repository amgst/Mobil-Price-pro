import { type User, type InsertUser, type Brand, type InsertBrand, type Mobile, type InsertMobile } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Brand operations
  getAllBrands(): Promise<Brand[]>;
  getBrandBySlug(slug: string): Promise<Brand | undefined>;
  createBrand(brand: InsertBrand): Promise<Brand>;
  
  // Mobile operations
  getAllMobiles(): Promise<Mobile[]>;
  getMobilesByBrand(brandSlug: string): Promise<Mobile[]>;
  getMobileBySlug(brandSlug: string, mobileSlug: string): Promise<Mobile | undefined>;
  searchMobiles(query: string): Promise<Mobile[]>;
  getFeaturedMobiles(): Promise<Mobile[]>;
  createMobile(mobile: InsertMobile): Promise<Mobile>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private brands: Map<string, Brand>;
  private mobiles: Map<string, Mobile>;

  constructor() {
    this.users = new Map();
    this.brands = new Map();
    this.mobiles = new Map();
    this.initializeData();
  }

  private initializeData() {
    // Initialize sample brands
    const sampleBrands: Brand[] = [
      {
        id: "brand-1",
        name: "Samsung",
        slug: "samsung",
        logo: "S",
        phoneCount: "142",
        description: "South Korean multinational electronics company",
        createdAt: new Date(),
      },
      {
        id: "brand-2", 
        name: "Apple",
        slug: "apple",
        logo: "A",
        phoneCount: "28",
        description: "American multinational technology company",
        createdAt: new Date(),
      },
      {
        id: "brand-3",
        name: "Xiaomi", 
        slug: "xiaomi",
        logo: "X",
        phoneCount: "89",
        description: "Chinese electronics company",
        createdAt: new Date(),
      },
      {
        id: "brand-4",
        name: "Oppo",
        slug: "oppo", 
        logo: "O",
        phoneCount: "67",
        description: "Chinese consumer electronics company",
        createdAt: new Date(),
      },
      {
        id: "brand-5",
        name: "Vivo",
        slug: "vivo",
        logo: "V", 
        phoneCount: "54",
        description: "Chinese technology company",
        createdAt: new Date(),
      },
      {
        id: "brand-6",
        name: "Realme",
        slug: "realme",
        logo: "R",
        phoneCount: "43", 
        description: "Chinese smartphone manufacturer",
        createdAt: new Date(),
      },
    ];

    sampleBrands.forEach(brand => this.brands.set(brand.id, brand));

    // Initialize sample mobiles
    const sampleMobiles: Mobile[] = [
      {
        id: "mobile-1",
        slug: "galaxy-s24-ultra",
        name: "Galaxy S24 Ultra",
        brand: "samsung",
        model: "S24 Ultra",
        imageUrl: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
        imagekitPath: null,
        releaseDate: "2024-01-01",
        price: "₨ 449,999",
        shortSpecs: {
          ram: "12GB",
          storage: "256GB", 
          camera: "200MP",
          battery: "5000mAh",
          display: "6.8\" Dynamic AMOLED 2X",
          processor: "Snapdragon 8 Gen 3",
        },
        carouselImages: [
          "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=600",
          "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=600",
          "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=600",
        ],
        specifications: [
          {
            category: "Display",
            specs: [
              { feature: "Screen Size", value: "6.8 inches" },
              { feature: "Resolution", value: "3120 x 1440 pixels" },
              { feature: "Display Type", value: "Dynamic AMOLED 2X" },
              { feature: "Refresh Rate", value: "120Hz" },
            ],
          },
          {
            category: "Performance",
            specs: [
              { feature: "Processor", value: "Snapdragon 8 Gen 3" },
              { feature: "RAM", value: "12GB" },
              { feature: "Storage", value: "256GB" },
              { feature: "OS", value: "Android 14" },
            ],
          },
          {
            category: "Camera",
            specs: [
              { feature: "Main Camera", value: "200MP" },
              { feature: "Ultra Wide", value: "12MP" },
              { feature: "Telephoto", value: "50MP" },
              { feature: "Front Camera", value: "12MP" },
            ],
          },
        ],
        dimensions: {
          height: "162.3mm",
          width: "79.0mm", 
          thickness: "8.6mm",
          weight: "232g",
        },
        buildMaterials: {
          frame: "Titanium",
          back: "Glass",
          protection: "Gorilla Glass Victus 2",
        },
        createdAt: new Date(),
      },
      {
        id: "mobile-2",
        slug: "iphone-15-pro-max",
        name: "iPhone 15 Pro Max",
        brand: "apple",
        model: "15 Pro Max",
        imageUrl: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
        imagekitPath: null,
        releaseDate: "2023-09-01",
        price: "₨ 519,999",
        shortSpecs: {
          ram: "8GB",
          storage: "256GB",
          camera: "48MP",
          battery: "4441mAh",
          display: "6.7\" Super Retina XDR",
          processor: "A17 Pro",
        },
        carouselImages: [
          "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=600",
        ],
        specifications: [
          {
            category: "Display",
            specs: [
              { feature: "Screen Size", value: "6.7 inches" },
              { feature: "Resolution", value: "2796 x 1290 pixels" },
              { feature: "Display Type", value: "Super Retina XDR OLED" },
              { feature: "Refresh Rate", value: "120Hz" },
            ],
          },
        ],
        dimensions: null,
        buildMaterials: null,
        createdAt: new Date(),
      },
      {
        id: "mobile-3",
        slug: "xiaomi-14-pro",
        name: "Xiaomi 14 Pro",
        brand: "xiaomi",
        model: "14 Pro",
        imageUrl: "https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
        imagekitPath: null,
        releaseDate: "2024-02-01",
        price: "₨ 189,999",
        shortSpecs: {
          ram: "12GB",
          storage: "256GB",
          camera: "50MP",
          battery: "4880mAh",
          display: "6.73\" LTPO OLED",
          processor: "Snapdragon 8 Gen 3",
        },
        carouselImages: [
          "https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=600",
        ],
        specifications: [
          {
            category: "Display",
            specs: [
              { feature: "Screen Size", value: "6.73 inches" },
              { feature: "Resolution", value: "3200 x 1440 pixels" },
              { feature: "Display Type", value: "LTPO OLED" },
              { feature: "Refresh Rate", value: "120Hz" },
            ],
          },
        ],
        dimensions: null,
        buildMaterials: null,
        createdAt: new Date(),
      },
      {
        id: "mobile-4",
        slug: "oneplus-12",
        name: "OnePlus 12",
        brand: "oneplus",
        model: "12",
        imageUrl: "https://images.unsplash.com/photo-1585060544812-6b45742d762f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
        imagekitPath: null,
        releaseDate: "2024-01-15",
        price: "₨ 299,999",
        shortSpecs: {
          ram: "16GB",
          storage: "512GB",
          camera: "50MP",
          battery: "5400mAh",
          display: "6.82\" LTPO OLED",
          processor: "Snapdragon 8 Gen 3",
        },
        carouselImages: [
          "https://images.unsplash.com/photo-1585060544812-6b45742d762f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=600",
        ],
        specifications: [
          {
            category: "Display",
            specs: [
              { feature: "Screen Size", value: "6.82 inches" },
              { feature: "Resolution", value: "3168 x 1440 pixels" },
              { feature: "Display Type", value: "LTPO OLED" },
              { feature: "Refresh Rate", value: "120Hz" },
            ],
          },
        ],
        dimensions: null,
        buildMaterials: null,
        createdAt: new Date(),
      },
    ];

    sampleMobiles.forEach(mobile => this.mobiles.set(mobile.id, mobile));
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getAllBrands(): Promise<Brand[]> {
    return Array.from(this.brands.values());
  }

  async getBrandBySlug(slug: string): Promise<Brand | undefined> {
    return Array.from(this.brands.values()).find(brand => brand.slug === slug);
  }

  async createBrand(brand: InsertBrand): Promise<Brand> {
    const id = randomUUID();
    const newBrand: Brand = { 
      ...brand, 
      id, 
      logo: brand.logo || null,
      phoneCount: brand.phoneCount || null,
      description: brand.description || null,
      createdAt: new Date() 
    };
    this.brands.set(id, newBrand);
    return newBrand;
  }

  async getAllMobiles(): Promise<Mobile[]> {
    return Array.from(this.mobiles.values());
  }

  async getMobilesByBrand(brandSlug: string): Promise<Mobile[]> {
    return Array.from(this.mobiles.values()).filter(mobile => mobile.brand === brandSlug);
  }

  async getMobileBySlug(brandSlug: string, mobileSlug: string): Promise<Mobile | undefined> {
    return Array.from(this.mobiles.values()).find(
      mobile => mobile.brand === brandSlug && mobile.slug === mobileSlug
    );
  }

  async searchMobiles(query: string): Promise<Mobile[]> {
    const searchTerm = query.toLowerCase();
    return Array.from(this.mobiles.values()).filter(mobile => 
      mobile.name.toLowerCase().includes(searchTerm) ||
      mobile.brand.toLowerCase().includes(searchTerm) ||
      mobile.model.toLowerCase().includes(searchTerm)
    );
  }

  async getFeaturedMobiles(): Promise<Mobile[]> {
    // Return the first 8 mobiles as featured
    return Array.from(this.mobiles.values()).slice(0, 8);
  }

  async createMobile(mobile: InsertMobile): Promise<Mobile> {
    const id = randomUUID();
    const newMobile: Mobile = { 
      ...mobile, 
      id, 
      imagekitPath: mobile.imagekitPath || null,
      price: mobile.price || null,
      dimensions: mobile.dimensions || null,
      buildMaterials: mobile.buildMaterials || null,
      shortSpecs: {
        ram: mobile.shortSpecs.ram,
        storage: mobile.shortSpecs.storage,
        camera: mobile.shortSpecs.camera,
        battery: mobile.shortSpecs.battery as string | undefined,
        display: mobile.shortSpecs.display as string | undefined,
        processor: mobile.shortSpecs.processor as string | undefined,
      },
      carouselImages: mobile.carouselImages as string[],
      specifications: mobile.specifications as { category: string; specs: { feature: string; value: string; }[]; }[],
      createdAt: new Date() 
    };
    this.mobiles.set(id, newMobile);
    return newMobile;
  }
}

export const storage = new MemStorage();
