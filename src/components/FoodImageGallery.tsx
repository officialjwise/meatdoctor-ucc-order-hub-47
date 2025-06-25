
import React, { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';

interface FoodImageGalleryProps {
  images: string[];
  foodName: string;
  isOpen: boolean;
  onClose: () => void;
  initialIndex?: number;
}

const FoodImageGallery: React.FC<FoodImageGalleryProps> = ({
  images,
  foodName,
  isOpen,
  onClose,
  initialIndex = 0
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  
  if (!images || images.length === 0) {
    return null;
  }
  
  const goToNextImage = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };
  
  const goToPrevImage = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  };
  
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'ArrowRight') {
      goToNextImage();
    } else if (event.key === 'ArrowLeft') {
      goToPrevImage();
    } else if (event.key === 'Escape') {
      onClose();
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="sm:max-w-4xl p-0 overflow-hidden bg-black/95 border-gray-700"
        onKeyDown={handleKeyDown}
      >
        <div className="relative w-full h-full flex items-center justify-center min-h-[80vh]">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 z-10 rounded-full bg-black/50 hover:bg-black/70 text-white"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
            <span className="sr-only">Close</span>
          </Button>
          
          <div className="w-full flex items-center justify-center p-4">
            {images.length > 1 && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-2 top-1/2 transform -translate-y-1/2 z-10 rounded-full bg-black/50 hover:bg-black/70 text-white"
                onClick={goToPrevImage}
              >
                <ChevronLeft className="h-6 w-6" />
                <span className="sr-only">Previous image</span>
              </Button>
            )}
            
            <div className="w-full h-full flex items-center justify-center">
              <img
                src={images[currentIndex]}
                alt={`${foodName} - Image ${currentIndex + 1}`}
                className="max-h-[75vh] max-w-full object-contain rounded-lg"
                onError={(e) => {
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9';
                }}
              />
            </div>
            
            {images.length > 1 && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 z-10 rounded-full bg-black/50 hover:bg-black/70 text-white"
                onClick={goToNextImage}
              >
                <ChevronRight className="h-6 w-6" />
                <span className="sr-only">Next image</span>
              </Button>
            )}
          </div>
          
          {images.length > 1 && (
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
              {images.map((_, index) => (
                <button
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentIndex
                      ? 'bg-white'
                      : 'bg-gray-500 hover:bg-gray-300'
                  }`}
                  onClick={() => setCurrentIndex(index)}
                  aria-label={`Go to image ${index + 1}`}
                />
              ))}
            </div>
          )}
          
          <div className="absolute bottom-2 left-2 bg-black/70 text-white px-3 py-1 rounded-md text-sm">
            {images.length > 1 ? `${currentIndex + 1} / ${images.length}` : '1 / 1'}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FoodImageGallery;
