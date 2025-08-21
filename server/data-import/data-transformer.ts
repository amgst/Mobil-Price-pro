import { InsertMobile, InsertBrand } from "@shared/schema";

interface RapidAPIPhone {
  id: number;
  manufacturer: string;
  model: string;
  chipset?: string;
  androidVersion?: string;
  battery?: string;
  cpu?: string;
  displayResolution?: string;
  displaySize?: string;
  displayType?: string;
  gpu?: string;
  internal?: string;
  mainCameraFeatures?: string;
  mainCameraSpecs?: string;
  mainVideoSpecs?: string;
  selfieCameraFeatures?: string;
  selfieCameraSpecs?: string;
  selfieVideoSpecs?: string;
  sensors?: string;
}

// No longer needed as brands are just strings

export class DataTransformer {
  
  static transformBrand(brandName: string, phoneCount: number = 0): InsertBrand {
    const slug = this.createSlug(brandName);
    const logo = this.getBrandLogo(brandName);
    
    return {
      name: brandName,
      slug: slug,
      logo: logo,
      phoneCount: phoneCount.toString(),
      description: this.getBrandDescription(brandName)
    };
  }

  static transformMobile(rapidApiPhone: RapidAPIPhone): InsertMobile {
    const fullName = `${rapidApiPhone.manufacturer} ${rapidApiPhone.model}`;
    const slug = this.createSlug(fullName);
    const brandSlug = this.createSlug(rapidApiPhone.manufacturer);
    
    // Extract short specs from available data
    const shortSpecs = this.extractShortSpecsFromRapidAPI(rapidApiPhone);
    
    // Transform detailed specifications
    const specifications = this.transformDetailedSpecsFromRapidAPI(rapidApiPhone);
    
    // Generate placeholder image URL (GSMArena pattern)
    const imageUrl = this.generateImageUrl(rapidApiPhone.manufacturer, rapidApiPhone.model);
    
    // Get carousel images
    const carouselImages = [imageUrl];
    
    return {
      slug: slug,
      name: fullName,
      brand: brandSlug,
      model: rapidApiPhone.model,
      imageUrl: imageUrl,
      imagekitPath: `/mobiles/${brandSlug}/${slug}.jpg`,
      releaseDate: this.extractReleaseDateFromAndroid(rapidApiPhone.androidVersion),
      price: 'Price not available',
      shortSpecs: shortSpecs,
      carouselImages: carouselImages,
      specifications: specifications,
      dimensions: null,
      buildMaterials: null
    };
  }

  private static createSlug(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
      .replace(/^-|-$/g, '');
  }

  private static getBrandLogo(brandName: string): string {
    const logoMap: Record<string, string> = {
      'Apple': '🍎',
      'Samsung': 'S',
      'Xiaomi': 'X',
      'OnePlus': '1+',
      'Google': 'G',
      'Huawei': 'H',
      'Oppo': 'O',
      'Vivo': 'V',
      'Sony': 'S',
      'Nokia': 'N',
      'Motorola': 'M',
      'Realme': 'R',
      'Honor': 'H',
      'Nothing': 'N'
    };
    
    return logoMap[brandName] || brandName.charAt(0).toUpperCase();
  }

  private static getBrandDescription(brandName: string): string {
    const descriptions: Record<string, string> = {
      'Apple': 'American multinational technology company',
      'Samsung': 'South Korean multinational electronics corporation',
      'Xiaomi': 'Chinese electronics company',
      'OnePlus': 'Chinese smartphone manufacturer',
      'Google': 'American multinational technology corporation',
      'Huawei': 'Chinese multinational technology corporation',
      'Oppo': 'Chinese consumer electronics company',
      'Vivo': 'Chinese technology company',
      'Sony': 'Japanese multinational electronics corporation',
      'Nokia': 'Finnish multinational telecommunications company',
      'Motorola': 'American telecommunications company',
      'Realme': 'Chinese smartphone brand',
      'Honor': 'Chinese smartphone brand',
      'Nothing': 'British consumer technology company'
    };
    
    return descriptions[brandName] || `${brandName} smartphone manufacturer`;
  }

  private static extractShortSpecsFromRapidAPI(rapidApiPhone: RapidAPIPhone): {
    ram: string;
    storage: string;
    camera: string;
    battery?: string;
    display?: string;
    processor?: string;
  } {
    // Extract RAM and storage from internal string like "128GB 8GB RAM, 256GB 8GB RAM"
    const internal = rapidApiPhone.internal || '';
    let ram = '';
    let storage = '';
    
    const ramMatch = internal.match(/(\d+GB)\s+RAM/);
    if (ramMatch) ram = ramMatch[1];
    
    const storageMatch = internal.match(/(\d+GB)\s+\d+GB\s+RAM/);
    if (storageMatch) storage = storageMatch[1];

    return {
      ram: ram || 'Unknown',
      storage: storage || 'Unknown',
      camera: rapidApiPhone.mainCameraSpecs || 'Unknown',
      battery: rapidApiPhone.battery,
      display: rapidApiPhone.displaySize,
      processor: rapidApiPhone.chipset
    };
  }

  private static transformDetailedSpecsFromRapidAPI(rapidApiPhone: RapidAPIPhone): Array<{
    category: string;
    specs: Array<{ feature: string; value: string }>;
  }> {
    const specs = [];

    // Display category
    if (rapidApiPhone.displaySize || rapidApiPhone.displayType || rapidApiPhone.displayResolution) {
      specs.push({
        category: 'Display',
        specs: [
          { feature: 'Screen Size', value: rapidApiPhone.displaySize || 'Unknown' },
          { feature: 'Resolution', value: rapidApiPhone.displayResolution || 'Unknown' },
          { feature: 'Display Type', value: rapidApiPhone.displayType || 'Unknown' }
        ].filter(spec => spec.value !== 'Unknown')
      });
    }

    // Camera category
    if (rapidApiPhone.mainCameraSpecs || rapidApiPhone.selfieCameraSpecs) {
      specs.push({
        category: 'Camera',
        specs: [
          { feature: 'Main Camera', value: rapidApiPhone.mainCameraSpecs || 'Unknown' },
          { feature: 'Front Camera', value: rapidApiPhone.selfieCameraSpecs || 'Unknown' },
          { feature: 'Main Features', value: rapidApiPhone.mainCameraFeatures || 'Unknown' },
          { feature: 'Video Recording', value: rapidApiPhone.mainVideoSpecs || 'Unknown' }
        ].filter(spec => spec.value !== 'Unknown')
      });
    }

    // Performance category
    if (rapidApiPhone.chipset || rapidApiPhone.cpu || rapidApiPhone.gpu) {
      specs.push({
        category: 'Performance',
        specs: [
          { feature: 'Chipset', value: rapidApiPhone.chipset || 'Unknown' },
          { feature: 'CPU', value: rapidApiPhone.cpu || 'Unknown' },
          { feature: 'GPU', value: rapidApiPhone.gpu || 'Unknown' }
        ].filter(spec => spec.value !== 'Unknown')
      });
    }

    // Battery & Storage
    if (rapidApiPhone.battery || rapidApiPhone.internal) {
      specs.push({
        category: 'Battery & Storage',
        specs: [
          { feature: 'Battery', value: rapidApiPhone.battery || 'Unknown' },
          { feature: 'Internal Storage', value: rapidApiPhone.internal || 'Unknown' }
        ].filter(spec => spec.value !== 'Unknown')
      });
    }

    // Other features
    if (rapidApiPhone.sensors || rapidApiPhone.androidVersion) {
      specs.push({
        category: 'Features',
        specs: [
          { feature: 'Operating System', value: `Android ${rapidApiPhone.androidVersion || 'Unknown'}` },
          { feature: 'Sensors', value: rapidApiPhone.sensors || 'Unknown' }
        ].filter(spec => spec.value !== 'Unknown')
      });
    }

    return specs.filter(category => category.specs.length > 0);
  }

  private static extractDimensionsAndMaterials(specifications: Array<{
    category: string;
    specs: Array<{ feature: string; value: string }>;
  }>): {
    dimensions: { height: string; width: string; thickness: string; weight: string } | null;
    buildMaterials: { frame: string; back: string; protection: string } | null;
  } {
    let dimensions = null;
    let buildMaterials = null;

    specifications.forEach(category => {
      if (category.category.toLowerCase().includes('dimension') || 
          category.category.toLowerCase().includes('body')) {
        
        const dimObj = { height: '', width: '', thickness: '', weight: '' };
        const matObj = { frame: '', back: '', protection: '' };

        category.specs.forEach(spec => {
          const feature = spec.feature.toLowerCase();
          
          if (feature.includes('dimension') || feature.includes('size')) {
            // Parse dimensions like "162.3 x 79.0 x 8.6 mm"
            const parts = spec.value.split('x').map(p => p.trim());
            if (parts.length >= 3) {
              dimObj.height = parts[0];
              dimObj.width = parts[1];
              dimObj.thickness = parts[2];
            }
          } else if (feature.includes('weight')) {
            dimObj.weight = spec.value;
          } else if (feature.includes('build') || feature.includes('material')) {
            matObj.frame = spec.value;
          } else if (feature.includes('back')) {
            matObj.back = spec.value;
          } else if (feature.includes('protection')) {
            matObj.protection = spec.value;
          }
        });

        if (dimObj.height || dimObj.width || dimObj.thickness || dimObj.weight) {
          dimensions = dimObj;
        }
        if (matObj.frame || matObj.back || matObj.protection) {
          buildMaterials = matObj;
        }
      }
    });

    return { dimensions, buildMaterials };
  }

  private static generateImageUrl(manufacturer: string, model: string): string {
    // Generate GSMArena-style image URL pattern
    const cleanModel = model.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-');
    const cleanManufacturer = manufacturer.toLowerCase();
    
    return `https://fdn2.gsmarena.com/vv/bigpic/${cleanManufacturer}-${cleanModel}.jpg`;
  }

  private static extractReleaseDateFromAndroid(androidVersion?: string): string {
    if (!androidVersion) {
      return new Date().toISOString().split('T')[0];
    }
    
    // Map Android versions to approximate release dates
    const androidReleases: Record<string, string> = {
      '14': '2023-10-04',
      '13': '2022-08-15',
      '12': '2021-10-04',
      '11': '2020-09-08',
      '10': '2019-09-03',
      '9': '2018-08-06',
      '8': '2017-08-21',
      '7': '2016-08-22',
      '6': '2015-10-05'
    };
    
    const version = androidVersion.split('.')[0];
    return androidReleases[version] || new Date().toISOString().split('T')[0];
  }

  private static extractPrice(quickSpecs: Array<{ name: string; value: string }>): string {
    for (const spec of quickSpecs) {
      if (spec.name.toLowerCase().includes('price') || 
          spec.name.toLowerCase().includes('cost')) {
        return spec.value;
      }
    }
    return 'Price not available';
  }
}