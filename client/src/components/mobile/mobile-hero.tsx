import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { SafeImage } from "@/components/ui/safe-image";
import { useCompare } from "@/hooks/use-compare";
import { ImageUtils } from "@/lib/image-utils";
import type { Mobile } from "@shared/schema";

interface MobileHeroProps {
  mobile: Mobile;
}

export function MobileHero({ mobile }: MobileHeroProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const { addToCompare, isInCompare } = useCompare();
  const inCompare = isInCompare(mobile.id);

  // Create comprehensive image sources for hero display
  const allImages = ImageUtils.createImageSources(
    mobile.imageUrl,
    mobile.carouselImages || [],
    mobile.brand
  );

  const scrollToSpecs = () => {
    const specsSection = document.getElementById('detailed-specifications');
    if (specsSection) {
      specsSection.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start' 
      });
    }
  };

  const handleAddToCompare = () => {
    addToCompare(mobile);
  };

  return (
    <section className="mb-12">
      <Card>
        <CardContent className="p-0">
          <div className="lg:flex">
            {/* Image Gallery */}
            <div className="lg:w-1/2 p-6">
              <div className="aspect-square bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 rounded-lg mb-4 relative overflow-hidden shadow-inner">
                <SafeImage
                  src={allImages}
                  alt={mobile.name}
                  className="w-full h-full object-contain rounded-lg"
                  quality="high"
                  placeholder={ImageUtils.generatePlaceholder(allImages[0] || mobile.imageUrl)}
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  data-testid="mobile-hero-image"
                />
                
                {/* Image quality indicator */}
                <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
                  High Quality
                </div>
              </div>

              {/* Enhanced thumbnail gallery */}
              {allImages.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {allImages.slice(0, 8).map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`aspect-square rounded border-2 transition-all duration-200 hover:shadow-md ${
                        selectedImage === index
                          ? "border-primary ring-2 ring-primary/30 shadow-lg"
                          : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
                      }`}
                      data-testid={`mobile-hero-thumbnail-${index}`}
                    >
                      <SafeImage
                        src={image}
                        alt={`${mobile.name} view ${index + 1}`}
                        className="w-full h-full object-contain rounded"
                        quality="low"
                        showFallback={false}
                        loading="lazy"
                      />
                    </button>
                  ))}
                  
                  {/* View all images indicator */}
                  {allImages.length > 8 && (
                    <div className="aspect-square border-2 border-gray-200 dark:border-gray-600 rounded flex items-center justify-center text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800">
                      +{allImages.length - 8}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Specifications */}
            <div className="lg:w-1/2 p-6">
              <div className="mb-4">
                <Badge className="mb-2">{mobile.brand}</Badge>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{mobile.name}</h1>
              <div className="text-4xl font-bold text-green-600 mb-6" data-testid="mobile-price">
                {mobile.price}
              </div>

              {/* Key Features */}
              <div className="space-y-4 mb-6">
                {mobile.shortSpecs.display && (
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Display</span>
                    <span 
                      className="font-medium"
                      dangerouslySetInnerHTML={{ __html: mobile.shortSpecs.display }}
                    />
                  </div>
                )}
                {mobile.shortSpecs.processor && (
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Processor</span>
                    <span className="font-medium">{mobile.shortSpecs.processor}</span>
                  </div>
                )}
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">RAM</span>
                  <span className="font-medium">{mobile.shortSpecs.ram}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Storage</span>
                  <span className="font-medium">{mobile.shortSpecs.storage}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Main Camera</span>
                  <span 
                    className="font-medium"
                    dangerouslySetInnerHTML={{ __html: mobile.shortSpecs.camera }}
                  />
                </div>
                {mobile.shortSpecs.battery && (
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Battery</span>
                    <span className="font-medium">{mobile.shortSpecs.battery}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-4">
                <Button 
                  size="lg" 
                  className="flex-1"
                  onClick={scrollToSpecs}
                  data-testid="button-view-full-specs"
                >
                  View Full Specifications
                </Button>
                <Button 
                  variant={inCompare ? "default" : "outline"}
                  size="lg"
                  onClick={handleAddToCompare}
                  disabled={inCompare}
                  data-testid="button-add-to-compare"
                >
                  {inCompare ? "Added to Compare" : "Add to Compare"}
                </Button>
              </div>

              {/* Release Date */}
              <div className="mt-6 text-sm text-gray-600">
                <span className="font-medium">Release Date:</span> {mobile.releaseDate}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
