import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Camera, 
  Smartphone,
  Eye,
  RotateCcw,
  ArrowLeftRight,
  Layers
} from "lucide-react";
import { arvrService } from "@/lib/ar-vr-service";
import type { Mobile } from "@shared/schema";

interface ARComparisonProps {
  mobiles: Mobile[];
  onClose: () => void;
}

export function ARComparison({ mobiles, onClose }: ARComparisonProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isActive, setIsActive] = useState(false);
  const [positions, setPositions] = useState<Array<{ x: number; y: number }>>([
    { x: 250, y: 200 },
    { x: 450, y: 200 },
    { x: 350, y: 350 }
  ]);
  const [selectedDevice, setSelectedDevice] = useState<number | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [comparisonMode, setComparisonMode] = useState<'side-by-side' | 'overlay'>('side-by-side');

  useEffect(() => {
    return () => {
      arvrService.stopSession();
    };
  }, []);

  const startComparison = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    setIsLoading(true);
    setCameraError(null);
    
    try {
      const success = await arvrService.initializeCamera(videoRef.current);
      
      if (success) {
        await arvrService.startComparisonSession(mobiles);
        setIsActive(true);
        startRenderLoop();
      } else {
        setCameraError("Unable to access camera. Please check permissions.");
      }
    } catch (error) {
      setCameraError("Camera initialization failed. Please try again.");
      console.error('AR comparison initialization error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const startRenderLoop = () => {
    const render = () => {
      if (!isActive || !canvasRef.current || !videoRef.current) return;
      
      const ctx = canvasRef.current.getContext('2d');
      if (!ctx) return;

      // Clear canvas
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      
      // Draw video background
      ctx.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
      
      // Render each mobile device
      mobiles.forEach((mobile, index) => {
        if (index < positions.length) {
          const position = positions[index];
          const scale = 1.0;
          
          arvrService.renderAROverlay(
            canvasRef.current!,
            videoRef.current!,
            mobile,
            { ...position, scale }
          );
          
          // Draw device label
          ctx.save();
          ctx.fillStyle = selectedDevice === index ? '#3B82F6' : '#FFFFFF';
          ctx.strokeStyle = selectedDevice === index ? '#1D4ED8' : '#000000';
          ctx.lineWidth = 2;
          ctx.font = 'bold 14px Arial';
          ctx.textAlign = 'center';
          
          const text = mobile.name.substring(0, 20);
          const textWidth = ctx.measureText(text).width;
          
          // Background for text
          ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
          ctx.fillRect(
            position.x - textWidth/2 - 8,
            position.y - 100,
            textWidth + 16,
            24
          );
          
          // Text
          ctx.fillStyle = '#FFFFFF';
          ctx.fillText(text, position.x, position.y - 82);
          
          // Device number
          ctx.beginPath();
          ctx.arc(position.x - 40, position.y - 40, 15, 0, 2 * Math.PI);
          ctx.fillStyle = selectedDevice === index ? '#3B82F6' : '#6B7280';
          ctx.fill();
          ctx.fillStyle = '#FFFFFF';
          ctx.font = 'bold 12px Arial';
          ctx.fillText((index + 1).toString(), position.x - 40, position.y - 35);
          
          ctx.restore();
        }
      });
      
      // Draw comparison lines if in overlay mode
      if (comparisonMode === 'overlay' && positions.length >= 2) {
        ctx.save();
        ctx.strokeStyle = '#3B82F6';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        
        for (let i = 0; i < positions.length - 1; i++) {
          ctx.beginPath();
          ctx.moveTo(positions[i].x, positions[i].y);
          ctx.lineTo(positions[i + 1].x, positions[i + 1].y);
          ctx.stroke();
        }
        
        ctx.restore();
      }
      
      requestAnimationFrame(render);
    };
    render();
  };

  const stopComparison = () => {
    setIsActive(false);
    arvrService.stopSession();
  };

  const resetPositions = () => {
    setPositions([
      { x: 250, y: 200 },
      { x: 450, y: 200 },
      { x: 350, y: 350 }
    ]);
  };

  const arrangeSideBySide = () => {
    const spacing = 150;
    const startX = 300 - ((mobiles.length - 1) * spacing) / 2;
    
    setPositions(
      mobiles.map((_, index) => ({
        x: startX + index * spacing,
        y: 250
      }))
    );
    setComparisonMode('side-by-side');
  };

  const arrangeOverlay = () => {
    const centerX = 350;
    const centerY = 250;
    const radius = 50;
    
    setPositions(
      mobiles.map((_, index) => ({
        x: centerX + Math.cos((index * 2 * Math.PI) / mobiles.length) * radius,
        y: centerY + Math.sin((index * 2 * Math.PI) / mobiles.length) * radius
      }))
    );
    setComparisonMode('overlay');
  };

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // Find closest device
    let closestDevice = 0;
    let closestDistance = Infinity;
    
    positions.forEach((pos, index) => {
      const distance = Math.sqrt(Math.pow(x - pos.x, 2) + Math.pow(y - pos.y, 2));
      if (distance < closestDistance) {
        closestDistance = distance;
        closestDevice = index;
      }
    });
    
    // If clicked close to a device, select it
    if (closestDistance < 100) {
      setSelectedDevice(selectedDevice === closestDevice ? null : closestDevice);
    } else {
      // Otherwise, move the selected device or first device
      const targetIndex = selectedDevice ?? 0;
      setPositions(prev => prev.map((pos, index) => 
        index === targetIndex ? { x, y } : pos
      ));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-7xl h-full max-h-screen overflow-hidden">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Layers className="h-6 w-6 text-primary" />
              <div>
                <CardTitle className="text-xl">AR Phone Comparison</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Compare {mobiles.length} phones side by side in augmented reality
                </p>
              </div>
            </div>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
          
          {/* Device Info */}
          <div className="flex flex-wrap gap-2 mt-3">
            {mobiles.map((mobile, index) => (
              <Badge 
                key={mobile.id}
                variant={selectedDevice === index ? "default" : "secondary"}
                className="cursor-pointer"
                onClick={() => setSelectedDevice(selectedDevice === index ? null : index)}
              >
                {index + 1}. {mobile.brand} {mobile.name.substring(0, 15)}
              </Badge>
            ))}
          </div>
        </CardHeader>

        <CardContent className="pb-4">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full">
            
            {/* AR View */}
            <div className="lg:col-span-3 relative">
              <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
                <video
                  ref={videoRef}
                  className="absolute inset-0 w-full h-full object-cover"
                  playsInline
                  muted
                  style={{ display: isActive ? 'block' : 'none' }}
                />
                
                <canvas
                  ref={canvasRef}
                  width={800}
                  height={600}
                  className="absolute inset-0 w-full h-full cursor-crosshair"
                  onClick={handleCanvasClick}
                  style={{ display: isActive ? 'block' : 'none' }}
                />
                
                {!isActive && (
                  <div className="flex items-center justify-center h-full text-white">
                    <div className="text-center">
                      <Camera className="h-16 w-16 mx-auto mb-4 opacity-50" />
                      <h3 className="text-xl mb-2">AR Comparison Ready</h3>
                      <p className="text-sm opacity-75 mb-6">
                        Start camera to compare phones in augmented reality
                      </p>
                      
                      {cameraError && (
                        <div className="bg-red-900/50 border border-red-500 rounded p-3 mb-4">
                          <p className="text-red-200 text-sm">{cameraError}</p>
                        </div>
                      )}
                      
                      <Button 
                        onClick={startComparison}
                        disabled={isLoading}
                        className="bg-primary hover:bg-primary/90"
                      >
                        {isLoading ? (
                          <>Starting Camera...</>
                        ) : (
                          <>
                            <Eye className="h-4 w-4 mr-2" />
                            Start AR Comparison
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}
                
                {isActive && (
                  <div className="absolute top-4 left-4 bg-black/70 backdrop-blur text-white p-3 rounded-lg">
                    <p className="text-sm">
                      <strong>Tap</strong> devices to select • <strong>Tap empty space</strong> to move selected device
                    </p>
                  </div>
                )}
              </div>
              
              {/* AR Controls */}
              {isActive && (
                <div className="flex items-center justify-center gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={arrangeSideBySide}
                  >
                    <ArrowLeftRight className="h-4 w-4 mr-1" />
                    Side by Side
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={arrangeOverlay}
                  >
                    <Layers className="h-4 w-4 mr-1" />
                    Overlay
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={resetPositions}
                  >
                    <RotateCcw className="h-4 w-4 mr-1" />
                    Reset
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={stopComparison}
                    className="bg-red-500 hover:bg-red-600 text-white border-red-500"
                  >
                    Stop AR
                  </Button>
                </div>
              )}
            </div>

            {/* Control Panel */}
            <div className="space-y-4">
              {mobiles.map((mobile, index) => {
                const dimensions = arvrService.getDeviceDimensions(mobile.brand);
                
                return (
                  <Card 
                    key={mobile.id}
                    className={`cursor-pointer transition-all ${
                      selectedDevice === index ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => setSelectedDevice(selectedDevice === index ? null : index)}
                  >
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 text-xs flex items-center justify-center">
                          {index + 1}
                        </span>
                        {mobile.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-xs space-y-1">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Screen:</span>
                        <span>{dimensions.screenSize}"</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Size:</span>
                        <span>{dimensions.width}×{dimensions.height}mm</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Price:</span>
                        <span className="font-semibold text-green-600">{mobile.price}</span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
              
              {selectedDevice !== null && (
                <Card className="bg-primary/5">
                  <CardContent className="pt-4">
                    <p className="text-sm text-center">
                      <Smartphone className="h-4 w-4 inline mr-1" />
                      Device {selectedDevice + 1} selected
                    </p>
                    <p className="text-xs text-center text-muted-foreground mt-1">
                      Tap anywhere to move this device
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}