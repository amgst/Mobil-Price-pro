import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { 
  RotateCcw,
  Maximize2,
  Minimize2,
  Smartphone,
  RefreshCw,
  Pause,
  Play,
  MousePointerClick
} from "lucide-react";
import { arvrService } from "@/lib/ar-vr-service";
import type { Mobile } from "@shared/schema";

interface Phone360ViewProps {
  mobile: Mobile;
  onClose: () => void;
}

export function Phone360View({ mobile, onClose }: Phone360ViewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [rotation, setRotation] = useState([0]);
  const [zoom, setZoom] = useState([1]);
  const [isAutoRotate, setIsAutoRotate] = useState(true);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, rotation: 0 });
  const animationRef = useRef<number>();

  const dimensions = arvrService.getDeviceDimensions(mobile.brand);
  const modelData = arvrService.generate3DModelData(mobile);

  useEffect(() => {
    if (isAutoRotate) {
      startAutoRotation();
    } else {
      stopAutoRotation();
    }
    
    return () => stopAutoRotation();
  }, [isAutoRotate]);

  useEffect(() => {
    draw3DModel();
  }, [rotation, zoom, mobile]);

  const startAutoRotation = () => {
    const animate = () => {
      if (isAutoRotate && !isDragging) {
        setRotation(prev => [(prev[0] + 1) % 360]);
      }
      animationRef.current = requestAnimationFrame(animate);
    };
    animate();
  };

  const stopAutoRotation = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  };

  const draw3DModel = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const baseSize = 150 * zoom[0];
    const rotationRad = (rotation[0] * Math.PI) / 180;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw gradient background
    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, Math.max(canvas.width, canvas.height));
    gradient.addColorStop(0, '#f8fafc');
    gradient.addColorStop(1, '#e2e8f0');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw shadow
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.ellipse(
      centerX + Math.sin(rotationRad) * 10,
      centerY + baseSize + 20,
      baseSize * 0.8,
      baseSize * 0.2,
      0,
      0,
      2 * Math.PI
    );
    ctx.fill();
    ctx.restore();

    // Calculate 3D perspective
    const perspective = Math.cos(rotationRad);
    const sideVisible = Math.sin(rotationRad);
    const phoneWidth = baseSize * (0.6 + 0.4 * Math.abs(perspective));
    const phoneHeight = baseSize * 1.8;
    const phoneDepth = 20 * zoom[0];

    // Draw phone body
    ctx.save();
    
    // Main face
    const faceGradient = ctx.createLinearGradient(
      centerX - phoneWidth/2,
      centerY - phoneHeight/2,
      centerX + phoneWidth/2,
      centerY + phoneHeight/2
    );
    
    const brandColor = arvrService.getDeviceDimensions(mobile.brand);
    faceGradient.addColorStop(0, modelData.materials.body.color);
    faceGradient.addColorStop(0.5, adjustBrightness(modelData.materials.body.color, 20));
    faceGradient.addColorStop(1, adjustBrightness(modelData.materials.body.color, -20));
    
    ctx.fillStyle = faceGradient;
    ctx.fillRect(
      centerX - phoneWidth/2,
      centerY - phoneHeight/2,
      phoneWidth,
      phoneHeight
    );

    // Side edge (3D effect)
    if (Math.abs(sideVisible) > 0.1) {
      ctx.fillStyle = adjustBrightness(modelData.materials.body.color, sideVisible > 0 ? -40 : 40);
      
      // Right/Left edge
      const edgePoints = sideVisible > 0 ? [
        [centerX + phoneWidth/2, centerY - phoneHeight/2],
        [centerX + phoneWidth/2 + phoneDepth * sideVisible, centerY - phoneHeight/2],
        [centerX + phoneWidth/2 + phoneDepth * sideVisible, centerY + phoneHeight/2],
        [centerX + phoneWidth/2, centerY + phoneHeight/2]
      ] : [
        [centerX - phoneWidth/2, centerY - phoneHeight/2],
        [centerX - phoneWidth/2 - phoneDepth * Math.abs(sideVisible), centerY - phoneHeight/2],
        [centerX - phoneWidth/2 - phoneDepth * Math.abs(sideVisible), centerY + phoneHeight/2],
        [centerX - phoneWidth/2, centerY + phoneHeight/2]
      ];
      
      ctx.beginPath();
      ctx.moveTo(edgePoints[0][0], edgePoints[0][1]);
      edgePoints.forEach(([x, y]) => ctx.lineTo(x, y));
      ctx.closePath();
      ctx.fill();
    }

    // Draw screen
    const screenInset = 8;
    const screenGradient = ctx.createLinearGradient(
      centerX - phoneWidth/2 + screenInset,
      centerY - phoneHeight/2 + screenInset,
      centerX + phoneWidth/2 - screenInset,
      centerY + phoneHeight/2 - screenInset
    );
    screenGradient.addColorStop(0, '#000000');
    screenGradient.addColorStop(0.5, '#1a1a1a');
    screenGradient.addColorStop(1, '#000000');
    
    ctx.fillStyle = screenGradient;
    ctx.fillRect(
      centerX - phoneWidth/2 + screenInset,
      centerY - phoneHeight/2 + screenInset,
      phoneWidth - screenInset * 2,
      phoneHeight - screenInset * 2
    );

    // Screen reflection
    const reflectionGradient = ctx.createLinearGradient(
      centerX - phoneWidth/4,
      centerY - phoneHeight/2,
      centerX + phoneWidth/4,
      centerY + phoneHeight/2
    );
    reflectionGradient.addColorStop(0, 'rgba(255, 255, 255, 0.15)');
    reflectionGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.05)');
    reflectionGradient.addColorStop(1, 'rgba(255, 255, 255, 0.1)');
    
    ctx.fillStyle = reflectionGradient;
    ctx.fillRect(
      centerX - phoneWidth/2 + screenInset,
      centerY - phoneHeight/2 + screenInset,
      phoneWidth - screenInset * 2,
      phoneHeight - screenInset * 2
    );

    // Draw camera (simplified)
    if (Math.abs(perspective) > 0.5) {
      const cameraSize = 12 * zoom[0];
      ctx.fillStyle = '#1a1a1a';
      ctx.beginPath();
      ctx.arc(
        centerX - phoneWidth/3,
        centerY - phoneHeight/2 + 30,
        cameraSize,
        0,
        2 * Math.PI
      );
      ctx.fill();
      
      ctx.fillStyle = '#4a5568';
      ctx.beginPath();
      ctx.arc(
        centerX - phoneWidth/3,
        centerY - phoneHeight/2 + 30,
        cameraSize * 0.7,
        0,
        2 * Math.PI
      );
      ctx.fill();
    }

    // Brand logo/text
    ctx.fillStyle = '#666666';
    ctx.font = `${12 * zoom[0]}px Arial`;
    ctx.textAlign = 'center';
    ctx.fillText(
      mobile.brand.toUpperCase(),
      centerX,
      centerY + phoneHeight/2 - 30
    );

    ctx.restore();

    // Draw specifications overlay
    drawSpecsOverlay(ctx, canvas);
  };

  const drawSpecsOverlay = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    ctx.save();
    
    // Info panel
    const panelX = 20;
    const panelY = 20;
    const panelWidth = 200;
    const panelHeight = 120;
    
    // Panel background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(panelX, panelY, panelWidth, panelHeight);
    
    // Panel border
    ctx.strokeStyle = '#3B82F6';
    ctx.lineWidth = 2;
    ctx.strokeRect(panelX, panelY, panelWidth, panelHeight);
    
    // Info text
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '14px Arial';
    ctx.textAlign = 'left';
    
    const specs = [
      `Screen: ${dimensions.screenSize}"`,
      `Size: ${dimensions.width}×${dimensions.height}mm`,
      `Thickness: ${dimensions.depth}mm`,
      `Rotation: ${Math.round(rotation[0])}°`,
      `Zoom: ${Math.round(zoom[0] * 100)}%`
    ];
    
    specs.forEach((spec, index) => {
      ctx.fillText(spec, panelX + 10, panelY + 25 + index * 18);
    });
    
    ctx.restore();
  };

  const adjustBrightness = (color: string, percent: number): string => {
    // Simple brightness adjustment for hex colors
    const hex = color.replace('#', '');
    const r = Math.max(0, Math.min(255, parseInt(hex.substr(0, 2), 16) + percent));
    const g = Math.max(0, Math.min(255, parseInt(hex.substr(2, 2), 16) + percent));
    const b = Math.max(0, Math.min(255, parseInt(hex.substr(4, 2), 16) + percent));
    
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  };

  const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    setIsDragging(true);
    setDragStart({ x, y, rotation: rotation[0] });
    setIsAutoRotate(false);
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    setMousePosition({ x, y });
    
    if (isDragging) {
      const deltaX = x - dragStart.x;
      const newRotation = (dragStart.rotation + deltaX) % 360;
      setRotation([newRotation]);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const resetView = () => {
    setRotation([0]);
    setZoom([1]);
    setIsAutoRotate(true);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-6xl h-full max-h-screen overflow-hidden">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <RefreshCw className="h-6 w-6 text-primary" />
              <div>
                <CardTitle className="text-xl">360° Phone Exploration</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {mobile.name} - Interactive 3D model exploration
                </p>
              </div>
            </div>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
          
          <div className="flex items-center gap-4 mt-3">
            <Badge variant="secondary">{mobile.brand}</Badge>
            <span className="text-sm text-muted-foreground">
              {dimensions.screenSize}" • {dimensions.width}×{dimensions.height}mm
            </span>
            <Badge variant="outline" className={isAutoRotate ? "text-green-600" : "text-gray-500"}>
              {isAutoRotate ? "Auto-rotating" : "Manual"}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="pb-4">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full">
            
            {/* 3D View */}
            <div className="lg:col-span-3 relative">
              <div className="relative bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-lg overflow-hidden aspect-video border-2 border-slate-200 dark:border-slate-700">
                <canvas
                  ref={canvasRef}
                  width={800}
                  height={600}
                  className="w-full h-full cursor-grab active:cursor-grabbing"
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                />
                
                {/* 3D Controls Overlay */}
                <div className="absolute bottom-4 left-4 bg-black/70 backdrop-blur text-white p-3 rounded-lg">
                  <p className="text-sm">
                    <MousePointerClick className="inline h-4 w-4 mr-1" />
                    <strong>Drag</strong> to rotate • <strong>Use controls</strong> to zoom
                  </p>
                </div>
                
                {/* Zoom indicator */}
                <div className="absolute top-4 right-4 bg-black/70 backdrop-blur text-white px-3 py-2 rounded-lg">
                  <span className="text-sm">{Math.round(zoom[0] * 100)}% zoom</span>
                </div>
              </div>
              
              {/* 3D Controls */}
              <div className="flex items-center justify-center gap-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAutoRotate(!isAutoRotate)}
                >
                  {isAutoRotate ? (
                    <>
                      <Pause className="h-4 w-4 mr-1" />
                      Pause
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-1" />
                      Auto Rotate
                    </>
                  )}
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetView}
                >
                  <RotateCcw className="h-4 w-4 mr-1" />
                  Reset View
                </Button>
              </div>
            </div>

            {/* Control Panel */}
            <div className="space-y-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <RefreshCw className="h-4 w-4" />
                    Rotation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-muted-foreground">Angle: {Math.round(rotation[0])}°</label>
                      <Slider
                        value={rotation}
                        onValueChange={(value) => {
                          setRotation(value);
                          setIsAutoRotate(false);
                        }}
                        min={0}
                        max={360}
                        step={1}
                        className="mt-2"
                      />
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => {
                          setRotation([0]);
                          setIsAutoRotate(false);
                        }}
                      >
                        Front
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => {
                          setRotation([90]);
                          setIsAutoRotate(false);
                        }}
                      >
                        Side
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => {
                          setRotation([180]);
                          setIsAutoRotate(false);
                        }}
                      >
                        Back
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Maximize2 className="h-4 w-4" />
                    Zoom
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-muted-foreground">Scale: {Math.round(zoom[0] * 100)}%</label>
                      <Slider
                        value={zoom}
                        onValueChange={setZoom}
                        min={0.5}
                        max={3.0}
                        step={0.1}
                        className="mt-2"
                      />
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => setZoom([0.7])}
                      >
                        <Minimize2 className="h-3 w-3 mr-1" />
                        Small
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => setZoom([1.0])}
                      >
                        Normal
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => setZoom([2.0])}
                      >
                        <Maximize2 className="h-3 w-3 mr-1" />
                        Large
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Device Specifications */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">3D Model Info</CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Vertices:</span>
                    <span>{modelData.vertices.body.length / 3}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Textures:</span>
                    <span>{modelData.textures.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Materials:</span>
                    <span>{Object.keys(modelData.materials).length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Price:</span>
                    <span className="font-semibold text-green-600">{mobile.price}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}