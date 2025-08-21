import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { 
  Camera, 
  Hand, 
  RotateCcw, 
  Maximize2, 
  Minimize2,
  Smartphone,
  Eye
} from "lucide-react";
import { arvrService } from "@/lib/ar-vr-service";
import type { Mobile } from "@shared/schema";

interface VirtualTryOnProps {
  mobile: Mobile;
  onClose: () => void;
}

export function VirtualTryOn({ mobile, onClose }: VirtualTryOnProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isActive, setIsActive] = useState(false);
  const [scale, setScale] = useState([1]);
  const [position, setPosition] = useState({ x: 300, y: 200 });
  const [handSize, setHandSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const dimensions = arvrService.getDeviceDimensions(mobile.brand);

  useEffect(() => {
    return () => {
      // Cleanup on component unmount
      arvrService.stopSession();
    };
  }, []);

  const startTryOn = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    setIsLoading(true);
    setCameraError(null);
    
    try {
      // Initialize camera
      const success = await arvrService.initializeCamera(videoRef.current);
      
      if (success) {
        // Start AR session
        await arvrService.startTryOnSession(mobile);
        setIsActive(true);
        
        // Start rendering loop
        startRenderLoop();
      } else {
        setCameraError("Unable to access camera. Please check permissions.");
      }
    } catch (error) {
      setCameraError("Camera initialization failed. Please try again.");
      console.error('Try-on initialization error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const startRenderLoop = () => {
    const render = () => {
      if (!isActive || !canvasRef.current || !videoRef.current) return;
      
      arvrService.renderAROverlay(
        canvasRef.current,
        videoRef.current,
        mobile,
        { 
          x: position.x, 
          y: position.y, 
          scale: scale[0] * arvrService.calculateHandScale(handSize) 
        }
      );
      
      requestAnimationFrame(render);
    };
    render();
  };

  const stopTryOn = () => {
    setIsActive(false);
    arvrService.stopSession();
  };

  const resetPosition = () => {
    setPosition({ x: 300, y: 200 });
    setScale([1]);
  };

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    setPosition({ x, y });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-6xl h-full max-h-screen overflow-hidden">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Smartphone className="h-6 w-6 text-primary" />
              <div>
                <CardTitle className="text-xl">Virtual Phone Try-On</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {mobile.name} - See how it fits in your hand
                </p>
              </div>
            </div>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
          
          {/* Device Info */}
          <div className="flex items-center gap-4 mt-3">
            <Badge variant="secondary">{mobile.brand}</Badge>
            <span className="text-sm text-muted-foreground">
              {dimensions.width} × {dimensions.height} mm
            </span>
            <span className="text-sm text-muted-foreground">
              {dimensions.screenSize}" screen
            </span>
          </div>
        </CardHeader>

        <CardContent className="pb-4">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full">
            
            {/* AR View */}
            <div className="lg:col-span-3 relative">
              <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
                {/* Video Stream */}
                <video
                  ref={videoRef}
                  className="absolute inset-0 w-full h-full object-cover"
                  playsInline
                  muted
                  style={{ display: isActive ? 'block' : 'none' }}
                />
                
                {/* AR Canvas */}
                <canvas
                  ref={canvasRef}
                  width={800}
                  height={600}
                  className="absolute inset-0 w-full h-full cursor-crosshair"
                  onClick={handleCanvasClick}
                  style={{ display: isActive ? 'block' : 'none' }}
                />
                
                {/* Placeholder */}
                {!isActive && (
                  <div className="flex items-center justify-center h-full text-white">
                    <div className="text-center">
                      <Camera className="h-16 w-16 mx-auto mb-4 opacity-50" />
                      <h3 className="text-xl mb-2">Virtual Try-On Ready</h3>
                      <p className="text-sm opacity-75 mb-6">
                        Start camera to see how {mobile.name} fits in your hand
                      </p>
                      
                      {cameraError && (
                        <div className="bg-red-900/50 border border-red-500 rounded p-3 mb-4">
                          <p className="text-red-200 text-sm">{cameraError}</p>
                        </div>
                      )}
                      
                      <Button 
                        onClick={startTryOn}
                        disabled={isLoading}
                        className="bg-primary hover:bg-primary/90"
                      >
                        {isLoading ? (
                          <>Starting Camera...</>
                        ) : (
                          <>
                            <Eye className="h-4 w-4 mr-2" />
                            Start Virtual Try-On
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}
                
                {/* AR Instructions */}
                {isActive && (
                  <div className="absolute top-4 left-4 bg-black/70 backdrop-blur text-white p-3 rounded-lg">
                    <p className="text-sm">
                      <strong>Tap</strong> to move phone • <strong>Use controls</strong> to resize
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
                    onClick={resetPosition}
                  >
                    <RotateCcw className="h-4 w-4 mr-1" />
                    Reset
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={stopTryOn}
                    className="bg-red-500 hover:bg-red-600 text-white border-red-500"
                  >
                    Stop Try-On
                  </Button>
                </div>
              )}
            </div>

            {/* Control Panel */}
            <div className="space-y-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Hand className="h-4 w-4" />
                    Hand Size
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {(['small', 'medium', 'large'] as const).map((size) => (
                      <Button
                        key={size}
                        variant={handSize === size ? "default" : "outline"}
                        size="sm"
                        className="w-full justify-start"
                        onClick={() => setHandSize(size)}
                      >
                        {size.charAt(0).toUpperCase() + size.slice(1)}
                        {size === 'medium' && <Badge className="ml-auto" variant="secondary">Avg</Badge>}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Maximize2 className="h-4 w-4" />
                    Phone Size
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-muted-foreground">Scale: {Math.round(scale[0] * 100)}%</label>
                      <Slider
                        value={scale}
                        onValueChange={setScale}
                        min={0.5}
                        max={2.0}
                        step={0.1}
                        className="mt-2"
                      />
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => setScale([0.8])}
                      >
                        <Minimize2 className="h-3 w-3 mr-1" />
                        Small
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => setScale([1.2])}
                      >
                        <Maximize2 className="h-3 w-3 mr-1" />
                        Large
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Device Specs */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Specifications</CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Screen:</span>
                    <span>{dimensions.screenSize}"</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Dimensions:</span>
                    <span>{dimensions.width}×{dimensions.height}mm</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Thickness:</span>
                    <span>{dimensions.depth}mm</span>
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