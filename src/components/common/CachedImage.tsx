import React, { useEffect, useState } from 'react';
import { ImageCache } from '../../services/cache/ImageCache';
import { Loader } from 'lucide-react';

interface CachedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  fallback?: React.ReactNode;
}

export function CachedImage({ src, fallback, alt, className, ...props }: CachedImageProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let mounted = true;

    const loadImage = async () => {
      try {
        setLoading(true);
        setError(false);

        // Use original URL if it's a data URL
        if (src.startsWith('data:')) {
          setImageSrc(src);
          return;
        }

        const imageCache = ImageCache.getInstance();
        const cachedSrc = await imageCache.getImage(src);
        
        if (mounted) {
          setImageSrc(cachedSrc || src); // Fallback to original URL if cache fails
        }
      } catch (err) {
        console.warn('Image error:', err);
        if (mounted) {
          setError(true);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadImage();

    return () => {
      mounted = false;
    };
  }, [src]);

  if (loading) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <Loader className="w-6 h-6 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (error || !imageSrc) {
    return fallback || null;
  }

  return (
    <img 
      src={imageSrc} 
      alt={alt} 
      className={className} 
      {...props} 
      onError={() => setError(true)}
    />
  );
}