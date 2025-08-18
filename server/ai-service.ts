import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface MobileSpec {
  name: string;
  brand: string;
  model?: string;
  price?: string;
  shortSpecs: {
    ram: string;
    storage: string;
    camera: string;
    battery?: string;
    display?: string;
    processor?: string;
  };
}

export interface EnhancedMobileData {
  seoDescription: string;
  marketingDescription: string;
  keyFeatures: string[];
  targetAudience: string;
  comparisonPoints: string[];
}

export class AIService {
  async enhanceMobileData(mobile: MobileSpec): Promise<EnhancedMobileData> {
    try {
      const prompt = `
        Analyze this mobile phone and generate marketing content:
        
        Phone: ${mobile.name}
        Brand: ${mobile.brand}
        Price: ${mobile.price || "Not specified"}
        RAM: ${mobile.shortSpecs.ram}
        Storage: ${mobile.shortSpecs.storage}
        Camera: ${mobile.shortSpecs.camera}
        Battery: ${mobile.shortSpecs.battery || "Not specified"}
        Display: ${mobile.shortSpecs.display || "Not specified"}
        Processor: ${mobile.shortSpecs.processor || "Not specified"}
        
        Generate a JSON response with:
        - seoDescription: SEO-optimized meta description (150-160 chars)
        - marketingDescription: Engaging product description (2-3 paragraphs)
        - keyFeatures: Array of 4-5 standout features
        - targetAudience: Who this phone is best for
        - comparisonPoints: 3-4 key points for comparison with other phones
        
        Make it authentic and based on the actual specifications provided.
      `;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are an expert mobile phone analyst and copywriter. Generate authentic, compelling marketing content based on real specifications. Respond with JSON in the exact format requested."
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
      });

      const result = JSON.parse(response.choices[0].message.content || "{}");
      
      return {
        seoDescription: result.seoDescription || "",
        marketingDescription: result.marketingDescription || "",
        keyFeatures: result.keyFeatures || [],
        targetAudience: result.targetAudience || "",
        comparisonPoints: result.comparisonPoints || [],
      };
    } catch (error) {
      console.error("AI enhancement failed:", error);
      throw new Error("Failed to enhance mobile data with AI");
    }
  }

  async generateMobileSpecs(brandName: string, modelName: string, year?: string): Promise<MobileSpec> {
    try {
      const prompt = `
        Generate realistic mobile phone specifications for:
        Brand: ${brandName}
        Model: ${modelName}
        Year: ${year || "2024"}
        
        Create specifications that are realistic for this brand and model name.
        Include current market pricing in the local currency format.
        
        Return JSON with:
        - name: Full phone name
        - brand: Brand slug (lowercase)
        - model: Model name
        - price: Realistic price with currency
        - shortSpecs: object with ram, storage, camera, battery, display, processor
        
        Make specifications realistic and competitive for the current market.
      `;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are a mobile phone specification expert. Generate realistic, current market specifications based on brand positioning and market trends. Respond with JSON only."
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        response_format: { type: "json_object" },
        temperature: 0.3,
      });

      const result = JSON.parse(response.choices[0].message.content || "{}");
      
      return {
        name: result.name || `${brandName} ${modelName}`,
        brand: result.brand || brandName.toLowerCase(),
        model: result.model || modelName,
        price: result.price || "",
        shortSpecs: {
          ram: result.shortSpecs?.ram || "8GB",
          storage: result.shortSpecs?.storage || "128GB",
          camera: result.shortSpecs?.camera || "50MP",
          battery: result.shortSpecs?.battery,
          display: result.shortSpecs?.display,
          processor: result.shortSpecs?.processor,
        },
      };
    } catch (error) {
      console.error("AI spec generation failed:", error);
      throw new Error("Failed to generate mobile specifications with AI");
    }
  }

  async generateDetailedSpecs(mobile: MobileSpec): Promise<any[]> {
    try {
      const prompt = `
        Generate detailed technical specifications for this mobile phone:
        
        Phone: ${mobile.name}
        Brand: ${mobile.brand}
        Basic specs: RAM ${mobile.shortSpecs.ram}, Storage ${mobile.shortSpecs.storage}, Camera ${mobile.shortSpecs.camera}
        
        Create realistic detailed specifications organized in categories:
        - Display (size, resolution, type, refresh rate, protection)
        - Camera (main, ultra-wide, telephoto, front, video features)
        - Performance (processor, GPU, RAM, storage options)
        - Battery & Charging (capacity, charging speed, wireless charging)
        - Connectivity (5G, WiFi, Bluetooth, NFC, USB)
        - Build & Design (materials, dimensions, weight, colors)
        - Software (OS, UI, security features)
        
        Return JSON array with objects: { category: string, specs: [{ feature: string, value: string }] }
        Make specifications realistic for this brand and phone category.
      `;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are a technical specifications expert. Generate comprehensive, realistic mobile phone specifications based on current market standards. Respond with JSON only."
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        response_format: { type: "json_object" },
        temperature: 0.2,
      });

      const result = JSON.parse(response.choices[0].message.content || "{}");
      return result.specifications || [];
    } catch (error) {
      console.error("AI detailed specs generation failed:", error);
      throw new Error("Failed to generate detailed specifications with AI");
    }
  }

  async suggestSimilarPhones(mobile: MobileSpec, allMobiles: MobileSpec[]): Promise<string[]> {
    try {
      const mobilesContext = allMobiles.map(m => 
        `${m.name} - ${m.shortSpecs.ram} RAM, ${m.shortSpecs.storage} storage, ${m.price || "No price"}`
      ).join('\n');

      const prompt = `
        Given this phone: ${mobile.name} (${mobile.shortSpecs.ram} RAM, ${mobile.shortSpecs.storage} storage, ${mobile.price || "No price"})
        
        From this list of available phones, suggest 3-4 most similar ones for comparison:
        ${mobilesContext}
        
        Consider: price range, specifications, brand positioning, target audience.
        Return JSON array of phone names: ["Phone Name 1", "Phone Name 2", ...]
      `;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are a mobile phone comparison expert. Suggest similar phones based on specifications, price range, and target audience. Respond with JSON only."
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        response_format: { type: "json_object" },
        temperature: 0.3,
      });

      const result = JSON.parse(response.choices[0].message.content || "{}");
      return result.suggestions || [];
    } catch (error) {
      console.error("AI similar phones suggestion failed:", error);
      return [];
    }
  }
}

export const aiService = new AIService();