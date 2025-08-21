import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { SafeImage } from "@/components/ui/safe-image";
import { 
  Camera, 
  RotateCcw, 
  X,
  Maximize2,
  Minimize2,
  Hand,
  AlertCircle,
  Check
} from "lucide-react";
import type { Mobile } from "@shared/schema";

interface SimpleVirtualTryOnProps {
  mobile: Mobile;
  onClose: () => void;
}

export function SimpleVirtualTryOn({ mobile, onClose }: SimpleVirtualTryOnProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isActive, setIsActive] = useState(false);
  const [scale, setScale] = useState([1]);
  const [position, setPosition] = useState({ x: 50, y: 50 }); // percentage based
  const [handSize, setHandSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Real phone dimensions (iPhone 16 Pro as example)
  const phoneDimensions = {
    width: 77.6, // mm
    height: 159.9, // mm
    thickness: 8.25 // mm
  };

  // Hand size scaling factors
  const handScales = {
    small: 0.85,
    medium: 1.0,
    large: 1.15
  };

  const startCamera = async () => {
    if (!videoRef.current) return;
    
    setIsLoading(true);
    setCameraError(null);
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: { ideal: "environment" }, // Try rear camera first
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      
      videoRef.current.srcObject = stream;
      videoRef.current.play();
      setIsActive(true);
    } catch (error) {
      console.error('Camera access failed:', error);
      setCameraError("Unable to access camera. Please allow camera permission and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsActive(false);
  };

  const handleCanvasClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    setPosition({ x, y });
  };

  const resetPosition = () => {
    setPosition({ x: 50, y: 50 });
    setScale([1]);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  if (cameraError) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertCircle className="h-5 w-5 mr-2 text-red-500" />
              Camera Access Required
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600">{cameraError}</p>
            <div className="text-sm text-gray-500">
              <p className="font-medium mb-2">To enable Virtual Try-On:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Allow camera permission when prompted</li>
                <li>Make sure you're using HTTPS (secure connection)</li>
                <li>Try refreshing the page if camera doesn't work</li>
              </ul>
            </div>
            <div className="flex gap-2">
              <Button onClick={startCamera} className="flex-1">
                Try Again
              </Button>
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black z-50">
      <div className="relative w-full h-full">
        {/* Camera Feed */}
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          playsInline
          muted
        />

        {/* Virtual Phone Overlay */}
        {isActive && (
          <div 
            className="absolute inset-0 cursor-crosshair"
            onClick={handleCanvasClick}
          >
            <div
              className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-200 pointer-events-none"
              style={{
                left: `${position.x}%`,
                top: `${position.y}%`,
                transform: `translate(-50%, -50%) scale(${scale[0] * handScales[handSize]})`
              }}
            >
              {/* Phone Image */}
              <div className="relative">
                <SafeImage
                  src={mobile.imageUrl}
                  alt={mobile.name}
                  className="w-32 h-64 object-contain drop-shadow-2xl"
                />
                {/* Size indicator */}
                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-2 py-1 rounded text-xs whitespace-nowrap">
                  {Math.round(phoneDimensions.width * scale[0] * handScales[handSize])} × {Math.round(phoneDimensions.height * scale[0] * handScales[handSize])} mm
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Controls Overlay */}
        <div className="absolute top-4 left-4 right-4 z-10">
          <div className="flex items-center justify-between">
            <div className="bg-black/70 text-white px-3 py-2 rounded-lg">
              <h3 className="font-semibold">{mobile.name}</h3>
              <p className="text-sm opacity-80">Tap anywhere to position • Adjust size below</p>
            </div>
            <Button
              onClick={onClose}
              size="sm"
              variant="secondary"
              className="bg-black/70 hover:bg-black/80 text-white border-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Bottom Controls */}
        <div className="absolute bottom-4 left-4 right-4 z-10">
          <Card className="bg-black/80 text-white border-gray-600">
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Size Control */}
                <div>
                  <label className="text-sm font-medium block mb-2">
                    Phone Size: {Math.round(scale[0] * 100)}%
                  </label>
                  <Slider
                    value={scale}
                    onValueChange={setScale}
                    max={2}
                    min={0.5}
                    step={0.1}
                    className="w-full"
                  />
                </div>

                {/* Hand Size */}
                <div>
                  <label className="text-sm font-medium block mb-2">Hand Size</label>
                  <div className="flex gap-1">
                    {(['small', 'medium', 'large'] as const).map((size) => (
                      <Button
                        key={size}
                        size="sm"
                        variant={handSize === size ? "default" : "outline"}
                        onClick={() => setHandSize(size)}
                        className="flex-1 text-xs"
                      >
                        {size}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button onClick={resetPosition} size="sm" variant="outline" className="flex-1">
                    <RotateCcw className="h-4 w-4 mr-1" />
                    Reset
                  </Button>
                  {!isActive ? (
                    <Button onClick={startCamera} size="sm" disabled={isLoading} className="flex-1">
                      <Camera className="h-4 w-4 mr-1" />
                      {isLoading ? "Starting..." : "Start Camera"}
                    </Button>
                  ) : (
                    <Button onClick={stopCamera} size="sm" variant="destructive" className="flex-1">
                      Stop Camera
                    </Button>
                  )}
                </div>
              </div>

              {/* Instructions */}
              <div className="mt-4 text-xs text-gray-300">
                <div className="flex items-center gap-4">
                  <span className="flex items-center">
                    <Check className="h-3 w-3 mr-1" />
                    Real phone size: {phoneDimensions.width} × {phoneDimensions.height} mm
                  </span>
                  <span className="flex items-center">
                    <Hand className="h-3 w-3 mr-1" />
                    Adjust for your hand size
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}