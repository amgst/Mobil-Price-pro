import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { Mobile } from "@shared/schema";

interface MobileHeroProps {
  mobile: Mobile;
}

export function MobileHero({ mobile }: MobileHeroProps) {
  const [selectedImage, setSelectedImage] = useState(0);

  return (
    <section className="mb-12">
      <Card>
        <CardContent className="p-0">
          <div className="lg:flex">
            {/* Image Gallery */}
            <div className="lg:w-1/2 p-6">
              <div className="aspect-square bg-gray-50 rounded-lg mb-4">
                <img
                  src={mobile.carouselImages[selectedImage] || mobile.imageUrl}
                  alt={mobile.name}
                  className="w-full h-full object-contain rounded-lg"
                  data-testid="mobile-hero-image"
                />
              </div>
              {mobile.carouselImages.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {mobile.carouselImages.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`aspect-square object-cover rounded border transition-all ${
                        selectedImage === index
                          ? "border-primary ring-2 ring-primary/20"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      data-testid={`mobile-hero-thumbnail-${index}`}
                    >
                      <img
                        src={image}
                        alt={`${mobile.name} view ${index + 1}`}
                        className="w-full h-full object-contain rounded"
                      />
                    </button>
                  ))}
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
                    <span className="font-medium">{mobile.shortSpecs.display}</span>
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
                  <span className="font-medium">{mobile.shortSpecs.camera}</span>
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
                  data-testid="button-view-full-specs"
                >
                  View Full Specifications
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  data-testid="button-add-to-compare"
                >
                  Add to Compare
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
