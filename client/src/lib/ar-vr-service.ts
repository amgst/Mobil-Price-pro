/**
 * AR/VR Service for Mobile Phone Comparison
 * Handles camera access, AR rendering, and 3D model interactions
 */

import type { Mobile } from "@shared/schema";

export interface ARSession {
  id: string;
  isActive: boolean;
  mode: 'try-on' | 'comparison' | '360-view';
  devices: Mobile[];
}

export interface DeviceDimensions {
  width: number;
  height: number;
  depth: number;
  screenSize: number;
}

export class ARVRService {
  private static instance: ARVRService;
  private currentSession: ARSession | null = null;
  private videoStream: MediaStream | null = null;
  private canvas: HTMLCanvasElement | null = null;
  private context: CanvasRenderingContext2D | null = null;

  static getInstance(): ARVRService {
    if (!ARVRService.instance) {
      ARVRService.instance = new ARVRService();
    }
    return ARVRService.instance;
  }

  // Device dimensions database (in mm)
  private deviceDimensions: Record<string, DeviceDimensions> = {
    'apple': { width: 77.6, height: 160.9, depth: 7.8, screenSize: 6.1 },
    'samsung': { width: 79.0, height: 162.3, depth: 8.2, screenSize: 6.8 },
    'google': { width: 76.5, height: 162.6, depth: 8.8, screenSize: 6.7 },
    'xiaomi': { width: 75.3, height: 161.4, depth: 8.2, screenSize: 6.73 },
    'oneplus': { width: 75.8, height: 164.3, depth: 9.2, screenSize: 6.82 },
    'oppo': { width: 76.2, height: 162.6, depth: 9.5, screenSize: 6.82 },
    'vivo': { width: 76.3, height: 164.1, depth: 8.9, screenSize: 6.78 }
  };

  /**
   * Initialize camera access for AR features
   */
  async initializeCamera(videoElement: HTMLVideoElement): Promise<boolean> {
    try {
      // Check for camera permissions and WebRTC support
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Camera access not supported');
      }

      // Request camera access with optimal settings for AR
      this.videoStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          facingMode: { ideal: 'environment' } // Back camera preferred
        },
        audio: false
      });

      videoElement.srcObject = this.videoStream;
      await videoElement.play();
      
      return true;
    } catch (error) {
      console.error('Failed to initialize camera:', error);
      return false;
    }
  }

  /**
   * Start Virtual Phone Try-On session
   */
  async startTryOnSession(mobile: Mobile): Promise<ARSession> {
    const session: ARSession = {
      id: `tryon-${Date.now()}`,
      isActive: true,
      mode: 'try-on',
      devices: [mobile]
    };

    this.currentSession = session;
    return session;
  }

  /**
   * Start AR Comparison session
   */
  async startComparisonSession(mobiles: Mobile[]): Promise<ARSession> {
    const session: ARSession = {
      id: `comparison-${Date.now()}`,
      isActive: true,
      mode: 'comparison',
      devices: mobiles
    };

    this.currentSession = session;
    return session;
  }

  /**
   * Start 360° Phone Exploration
   */
  async start360ViewSession(mobile: Mobile): Promise<ARSession> {
    const session: ARSession = {
      id: `360view-${Date.now()}`,
      isActive: true,
      mode: '360-view',
      devices: [mobile]
    };

    this.currentSession = session;
    return session;
  }

  /**
   * Get device dimensions for AR rendering
   */
  getDeviceDimensions(brand: string): DeviceDimensions {
    return this.deviceDimensions[brand.toLowerCase()] || this.deviceDimensions['samsung'];
  }

  /**
   * Calculate scale factor for hand size comparison
   */
  calculateHandScale(handSize: 'small' | 'medium' | 'large' = 'medium'): number {
    const handSizes = {
      small: 0.85,   // 85% of average
      medium: 1.0,   // 100% baseline
      large: 1.15    // 115% of average
    };
    return handSizes[handSize];
  }

  /**
   * Generate 3D model data for 360° view
   */
  generate3DModelData(mobile: Mobile) {
    const dimensions = this.getDeviceDimensions(mobile.brand);
    
    return {
      vertices: this.generatePhoneVertices(dimensions),
      textures: mobile.carouselImages || [mobile.imageUrl],
      materials: {
        screen: { color: '#000000', reflectivity: 0.9 },
        body: { color: this.getBrandColor(mobile.brand), metallic: 0.8 },
        camera: { color: '#1a1a1a', roughness: 0.1 }
      },
      animations: {
        rotation: { speed: 0.02, axis: 'y' },
        zoom: { min: 0.5, max: 3.0 }
      }
    };
  }

  /**
   * Generate phone geometry vertices
   */
  private generatePhoneVertices(dimensions: DeviceDimensions) {
    const { width, height, depth } = dimensions;
    
    // Normalized coordinates for phone shape
    return {
      body: [
        // Front face (screen)
        -width/2, -height/2, depth/2,
        width/2, -height/2, depth/2,
        width/2, height/2, depth/2,
        -width/2, height/2, depth/2,
        
        // Back face
        -width/2, -height/2, -depth/2,
        width/2, -height/2, -depth/2,
        width/2, height/2, -depth/2,
        -width/2, height/2, -depth/2
      ],
      screen: [
        // Screen area (slightly inset)
        -width/2.2, -height/2.1, depth/2 + 0.1,
        width/2.2, -height/2.1, depth/2 + 0.1,
        width/2.2, height/2.1, depth/2 + 0.1,
        -width/2.2, height/2.1, depth/2 + 0.1
      ]
    };
  }

  /**
   * Get brand-specific color for 3D rendering
   */
  getBrandColor(brand: string): string {
    const brandColors: Record<string, string> = {
      'apple': '#A8DADC',      // Space Gray
      'samsung': '#4285F4',    // Samsung Blue
      'google': '#34A853',     // Google Green
      'xiaomi': '#FF6900',     // Xiaomi Orange
      'oneplus': '#EB0028',    // OnePlus Red
      'oppo': '#1BA854',       // Oppo Green
      'vivo': '#4A90E2'        // Vivo Blue
    };
    
    return brandColors[brand.toLowerCase()] || '#6B7280';
  }

  /**
   * Render AR overlay on canvas
   */
  renderAROverlay(
    canvas: HTMLCanvasElement, 
    videoElement: HTMLVideoElement,
    mobile: Mobile,
    position: { x: number; y: number; scale: number }
  ) {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear previous frame
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw video background
    ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
    
    // Draw phone overlay
    this.drawPhoneOverlay(ctx, mobile, position);
    
    // Draw size indicators
    this.drawSizeIndicators(ctx, mobile, position);
  }

  /**
   * Draw phone overlay on canvas
   */
  private drawPhoneOverlay(
    ctx: CanvasRenderingContext2D,
    mobile: Mobile,
    position: { x: number; y: number; scale: number }
  ) {
    const dimensions = this.getDeviceDimensions(mobile.brand);
    const width = 100 * position.scale;
    const height = (dimensions.height / dimensions.width) * width;
    
    ctx.save();
    
    // Phone body shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 5;
    
    // Phone body
    ctx.fillStyle = this.getBrandColor(mobile.brand);
    ctx.fillRect(
      position.x - width/2, 
      position.y - height/2, 
      width, 
      height
    );
    
    // Screen area
    ctx.fillStyle = '#000000';
    ctx.fillRect(
      position.x - width/2.2, 
      position.y - height/2.1, 
      width/1.1, 
      height/1.05
    );
    
    // Screen reflection
    const gradient = ctx.createLinearGradient(
      position.x - width/2.2, 
      position.y - height/2.1,
      position.x + width/2.2, 
      position.y + height/2.1
    );
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.1)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0.05)');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(
      position.x - width/2.2, 
      position.y - height/2.1, 
      width/1.1, 
      height/1.05
    );
    
    ctx.restore();
  }

  /**
   * Draw size indicators
   */
  private drawSizeIndicators(
    ctx: CanvasRenderingContext2D,
    mobile: Mobile,
    position: { x: number; y: number; scale: number }
  ) {
    const dimensions = this.getDeviceDimensions(mobile.brand);
    
    ctx.save();
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    
    // Screen size indicator
    ctx.fillText(
      `${dimensions.screenSize}" Screen`,
      position.x,
      position.y - 60
    );
    
    // Dimensions
    ctx.font = '12px Arial';
    ctx.fillText(
      `${dimensions.width} × ${dimensions.height} mm`,
      position.x,
      position.y + 60
    );
    
    ctx.restore();
  }

  /**
   * Stop current AR session
   */
  stopSession() {
    if (this.videoStream) {
      this.videoStream.getTracks().forEach(track => track.stop());
      this.videoStream = null;
    }
    
    if (this.currentSession) {
      this.currentSession.isActive = false;
      this.currentSession = null;
    }
  }

  /**
   * Check if AR features are supported
   */
  isARSupported(): boolean {
    return !!(
      typeof navigator !== 'undefined' &&
      navigator.mediaDevices?.getUserMedia &&
      typeof HTMLCanvasElement !== 'undefined' &&
      typeof CanvasRenderingContext2D !== 'undefined'
    );
  }

  /**
   * Get current session
   */
  getCurrentSession(): ARSession | null {
    return this.currentSession;
  }
}

export const arvrService = ARVRService.getInstance();