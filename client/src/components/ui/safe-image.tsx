import { useState } from "react";
import { Image, ImageOff } from "lucide-react";

interface SafeImageProps {
  src: string;
  alt: string;
  className?: string;
  fallback?: React.ReactNode;
  showFallback?: boolean;
  onLoad?: () => void;
  onError?: () => void;
  loading?: "lazy" | "eager";
  [key: string]: any;
}

export function SafeImage({ 
  src, 
  alt, 
  className = "", 
  fallback, 
  showFallback = true,
  onLoad,
  onError,
  loading = "lazy",
  ...props 
}: SafeImageProps) {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
    onLoad?.();
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
    onError?.();
  };

  if (hasError && !showFallback) {
    return null;
  }

  if (hasError) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 text-gray-400 ${className}`} {...props}>
        {fallback || (
          <div className="flex flex-col items-center justify-center space-y-2">
            <ImageOff className="w-8 h-8" />
            <span className="text-xs text-center">Image not available</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div className={`absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-400 ${className}`}>
          <div className="flex flex-col items-center justify-center space-y-2">
            <Image className="w-8 h-8 animate-pulse" />
            <span className="text-xs">Loading...</span>
          </div>
        </div>
      )}
      <img
        src={src}
        alt={alt}
        className={`${className} ${isLoading ? 'invisible' : ''}`}
        onLoad={handleLoad}
        onError={handleError}
        loading={loading}
        {...props}
      />
    </div>
  );
}