import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Camera,
  Smartphone,
  RefreshCw,
  Layers,
  Eye,
  Hand,
  ArrowLeftRight,
  Zap,
  Info
} from "lucide-react";
import { SimpleVirtualTryOn } from "./simple-virtual-tryon";
import { ARComparison } from "./ar-comparison";
import { Phone360View } from "./phone-360-view";
import { arvrService } from "@/lib/ar-vr-service";
import type { Mobile } from "@shared/schema";

interface ARVRHubProps {
  mobile?: Mobile;
  mobiles?: Mobile[];
  onClose: () => void;
}

type ARVRMode = 'hub' | 'try-on' | 'comparison' | '360-view';

export function ARVRHub({ mobile, mobiles = [], onClose }: ARVRHubProps) {
  const [currentMode, setCurrentMode] = useState<ARVRMode>('hub');
  const [selectedMobiles, setSelectedMobiles] = useState<Mobile[]>(
    mobile ? [mobile] : mobiles.slice(0, 3)
  );

  const isARSupported = arvrService.isARSupported();

  const features = [
    {
      id: 'try-on',
      title: 'Virtual Phone Try-On',
      description: 'See how the phone fits in your hand using AR camera',
      icon: Hand,
      color: 'bg-blue-500',
      requirements: 'Single phone + Camera access',
      disabled: !mobile || !isARSupported,
      disabledReason: !mobile ? 'Select a phone first' : 'Camera not supported'
    },
    {
      id: 'comparison',
      title: 'AR Phone Comparison',
      description: 'Compare multiple phones side-by-side in augmented reality',
      icon: Layers,
      color: 'bg-purple-500',
      requirements: '2-4 phones + Camera access',
      disabled: selectedMobiles.length < 2 || !isARSupported,
      disabledReason: selectedMobiles.length < 2 ? 'Select 2+ phones' : 'Camera not supported'
    },
    {
      id: '360-view',
      title: '360° Phone Exploration',
      description: 'Interactive 3D model with detailed specifications',
      icon: RefreshCw,
      color: 'bg-green-500',
      requirements: 'Single phone + 3D rendering',
      disabled: !mobile,
      disabledReason: 'Select a phone first'
    }
  ];

  const startFeature = (featureId: string) => {
    switch (featureId) {
      case 'try-on':
        if (mobile) setCurrentMode('try-on');
        break;
      case 'comparison':
        if (selectedMobiles.length >= 2) setCurrentMode('comparison');
        break;
      case '360-view':
        if (mobile) setCurrentMode('360-view');
        break;
    }
  };

  const renderCurrentMode = () => {
    switch (currentMode) {
      case 'try-on':
        return mobile ? (
          <SimpleVirtualTryOn 
            mobile={mobile} 
            onClose={() => setCurrentMode('hub')} 
          />
        ) : null;
        
      case 'comparison':
        return selectedMobiles.length >= 2 ? (
          <ARComparison 
            mobiles={selectedMobiles} 
            onClose={() => setCurrentMode('hub')} 
          />
        ) : null;
        
      case '360-view':
        return mobile ? (
          <Phone360View 
            mobile={mobile} 
            onClose={() => setCurrentMode('hub')} 
          />
        ) : null;
        
      default:
        return null;
    }
  };

  if (currentMode !== 'hub') {
    return renderCurrentMode();
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-5xl max-h-screen overflow-y-auto">
        <CardHeader className="pb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl">AR/VR Mobile Experience</CardTitle>
                <p className="text-muted-foreground">
                  Next-generation mobile phone visualization and comparison
                </p>
              </div>
            </div>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>

          {/* Current Selection */}
          <div className="mt-4">
            {mobile && (
              <div className="mb-4">
                <h4 className="text-sm font-medium mb-2">Selected Phone:</h4>
                <Badge variant="secondary" className="text-sm">
                  {mobile.brand} {mobile.name}
                </Badge>
              </div>
            )}
            
            {mobiles.length > 1 && (
              <div>
                <h4 className="text-sm font-medium mb-2">Available for Comparison:</h4>
                <div className="flex flex-wrap gap-2">
                  {mobiles.slice(0, 4).map((mob) => (
                    <Badge key={mob.id} variant="outline" className="text-xs">
                      {mob.brand} {mob.name.substring(0, 20)}
                    </Badge>
                  ))}
                  {mobiles.length > 4 && (
                    <Badge variant="outline">+{mobiles.length - 4} more</Badge>
                  )}
                </div>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="pb-6">
          {/* System Requirements Check */}
          <div className="mb-6 p-4 rounded-lg bg-slate-50 dark:bg-slate-800">
            <div className="flex items-center gap-2 mb-2">
              <Info className="h-4 w-4 text-blue-500" />
              <span className="font-medium text-sm">System Requirements</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <Camera className="h-4 w-4" />
                <span className={isARSupported ? "text-green-600" : "text-red-500"}>
                  Camera Access: {isARSupported ? "✓ Available" : "✗ Not Supported"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                <span className="text-green-600">
                  WebGL Support: ✓ Available
                </span>
              </div>
            </div>
            
            {!isARSupported && (
              <div className="mt-3 p-3 bg-amber-100 dark:bg-amber-900/30 rounded border border-amber-300 dark:border-amber-700">
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  <strong>Note:</strong> Camera features require HTTPS and camera permissions. 
                  3D exploration works without camera access.
                </p>
              </div>
            )}
          </div>

          {/* AR/VR Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((feature) => {
              const Icon = feature.icon;
              
              return (
                <Card 
                  key={feature.id}
                  className={`transition-all duration-200 hover:shadow-lg ${
                    feature.disabled 
                      ? 'opacity-60 cursor-not-allowed' 
                      : 'cursor-pointer hover:shadow-xl hover:scale-105'
                  }`}
                  onClick={() => !feature.disabled && startFeature(feature.id)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-lg ${feature.color}`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg">{feature.title}</CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <p className="text-muted-foreground mb-4 text-sm">
                      {feature.description}
                    </p>
                    
                    <div className="space-y-2">
                      <div className="text-xs text-muted-foreground">
                        <strong>Requirements:</strong> {feature.requirements}
                      </div>
                      
                      {feature.disabled ? (
                        <Badge variant="destructive" className="text-xs">
                          {feature.disabledReason}
                        </Badge>
                      ) : (
                        <Button 
                          size="sm" 
                          className="w-full"
                          onClick={(e) => {
                            e.stopPropagation();
                            startFeature(feature.id);
                          }}
                        >
                          Launch Experience
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Feature Comparison */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4">Feature Comparison</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Feature</th>
                    <th className="text-center py-2">Camera Required</th>
                    <th className="text-center py-2">Multiple Phones</th>
                    <th className="text-center py-2">3D Rendering</th>
                    <th className="text-left py-2">Best For</th>
                  </tr>
                </thead>
                <tbody className="text-xs">
                  <tr className="border-b">
                    <td className="py-3 font-medium">Virtual Try-On</td>
                    <td className="text-center">✓</td>
                    <td className="text-center">✗</td>
                    <td className="text-center">✓</td>
                    <td>Size comparison, fit testing</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 font-medium">AR Comparison</td>
                    <td className="text-center">✓</td>
                    <td className="text-center">✓</td>
                    <td className="text-center">✓</td>
                    <td>Side-by-side comparison</td>
                  </tr>
                  <tr>
                    <td className="py-3 font-medium">360° Exploration</td>
                    <td className="text-center">✗</td>
                    <td className="text-center">✗</td>
                    <td className="text-center">✓</td>
                    <td>Detailed inspection, specs</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}