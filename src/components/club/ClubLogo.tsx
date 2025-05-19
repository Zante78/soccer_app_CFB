import React from 'react';
import { Shield } from 'lucide-react';
import { CachedImage } from '../common/CachedImage';

interface ClubLogoProps {
  logoUrl?: string | null;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function ClubLogo({ logoUrl, size = 'md', className = '' }: ClubLogoProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  if (!logoUrl) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 rounded-full ${sizeClasses[size]} ${className}`}>
        <Shield className="w-1/2 h-1/2 text-gray-400" />
      </div>
    );
  }

  return (
    <div className={`relative rounded-full overflow-hidden bg-gray-100 ${sizeClasses[size]} ${className}`}>
      <CachedImage
        src={logoUrl}
        alt="Vereinslogo"
        className="absolute inset-0 w-full h-full object-cover"
        fallback={
          <div className="flex items-center justify-center w-full h-full">
            <Shield className="w-1/2 h-1/2 text-gray-400" />
          </div>
        }
      />
    </div>
  );
}