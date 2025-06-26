import React, { memo } from 'react';
import { User, AlertTriangle } from 'lucide-react';
import { CachedImage } from '../../common/CachedImage';
import { DuplicateStatus } from '../../../types/player';

interface PlayerCardHeaderProps {
  photoUrl?: string;
  firstName: string;
  lastName: string;
  averageRating: number;
  uploading?: boolean;
  duplicateStatus?: DuplicateStatus;
}

export const PlayerCardHeader = memo(function PlayerCardHeader({ 
  photoUrl, 
  firstName, 
  lastName, 
  averageRating,
  uploading = false,
  duplicateStatus
}: PlayerCardHeaderProps) {
  const fullName = `${firstName} ${lastName}`;
  const ratingLabel = `Durchschnittliche Bewertung: ${averageRating.toFixed(1)}`;

  const getRatingColor = (rating: number) => {
    if (rating >= 16) return 'bg-green-600';
    if (rating >= 12) return 'bg-blue-600';
    if (rating >= 8) return 'bg-yellow-600';
    return 'bg-red-600';
  };

  return (
    <div className="relative">
      <div className="aspect-square sm:aspect-video md:aspect-square lg:aspect-video xl:aspect-square bg-gray-100 relative overflow-hidden">
        {photoUrl ? (
          <CachedImage
            src={photoUrl}
            alt={fullName}
            className={`w-full h-full object-cover transition-transform duration-300 ease-out group-hover:scale-105 ${
              uploading ? 'opacity-50' : ''
            }`}
            fallback={
              <div className="w-full h-full flex items-center justify-center" aria-label={`Kein Foto für ${fullName}`}>
                <User className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400" aria-hidden="true" />
              </div>
            }
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center" aria-label={`Kein Foto für ${fullName}`}>
            <User className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400" aria-hidden="true" />
          </div>
        )}
        
        {/* Rating badge with responsive sizing */}
        <div 
          className={`absolute top-2 right-2 ${getRatingColor(averageRating)} text-white rounded-full w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center font-bold shadow-lg transform transition-transform duration-200 hover:scale-110`}
          aria-label={ratingLabel}
          title={ratingLabel}
        >
          <span className="text-sm sm:text-base">{averageRating.toFixed(1)}</span>
        </div>

        {/* Player name overlay with responsive text */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2 sm:p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <h3 className="text-white font-semibold text-sm sm:text-base md:text-lg truncate">
            {fullName}
          </h3>
        </div>
      </div>
    </div>
  );
});