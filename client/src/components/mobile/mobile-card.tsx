import { Link } from "wouter";
import { Plus, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SafeImage } from "@/components/ui/safe-image";
import { useCompare } from "@/hooks/use-compare";
import type { Mobile } from "@shared/schema";

interface MobileCardProps {
  mobile: Mobile;
}

export function MobileCard({ mobile }: MobileCardProps) {
  const { addToCompare, isInCompare } = useCompare();
  const inCompare = isInCompare(mobile.id);

  const handleAddToCompare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCompare(mobile);
  };

  return (
    <Link href={`/${mobile.brand}/${mobile.slug}`} data-testid={`mobile-card-${mobile.slug}`}>
      <div className="bg-white rounded-lg border hover:shadow-lg transition-shadow overflow-hidden cursor-pointer">
        <div className="aspect-square bg-gray-50 p-4">
          <SafeImage
            src={mobile.imageUrl}
            alt={mobile.name}
            className="w-full h-full object-contain"
            loading="lazy"
          />
        </div>
        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <Badge variant="secondary" className="text-xs">
              {mobile.brand}
            </Badge>
            <span className="text-xs text-gray-500">{mobile.releaseDate.split('-')[0]}</span>
          </div>
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2" title={mobile.name}>
            {mobile.name}
          </h3>
          <div className="text-lg font-bold text-green-600 mb-3">
            {mobile.price}
          </div>

          {/* Key Specs */}
          <div className="space-y-1 text-sm text-gray-600 mb-4">
            <div className="flex justify-between">
              <span>RAM:</span>
              <span>{mobile.shortSpecs.ram}</span>
            </div>
            <div className="flex justify-between">
              <span>Storage:</span>
              <span>{mobile.shortSpecs.storage}</span>
            </div>
            <div className="flex justify-between">
              <span>Camera:</span>
              <span>{mobile.shortSpecs.camera}</span>
            </div>
          </div>

          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              data-testid={`button-view-details-${mobile.slug}`}
            >
              View Details
            </Button>
            <Button
              variant={inCompare ? "default" : "outline"}
              size="sm"
              onClick={handleAddToCompare}
              disabled={inCompare}
              data-testid={`button-add-compare-${mobile.slug}`}
              title={inCompare ? "Already in comparison" : "Add to comparison"}
            >
              {inCompare ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>
    </Link>
  );
}
