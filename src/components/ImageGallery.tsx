
import React, { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTheme } from '@/hooks/use-theme';

interface ImageGalleryProps {
  images: string[];
  initialIndex?: number;
  isOpen: boolean;
  onClose: () => void;
}

const ImageGallery: React.FC<ImageGalleryProps> = ({
  images,
  initialIndex = 0,
  isOpen,
  onClose
}) => {
  const { theme } = useTheme();
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
        className={`sm:max-w-4xl p-0 overflow-hidden ${theme === 'dark' ? 'bg-gray-900 border-gray-700' : ''}`}
        onKeyDown={handleKeyDown}
      >
        <div className="relative w-full h-full flex items-center justify-center">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 z-10 rounded-full"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
            <span className="sr-only">Close</span>
          </Button>
          
          <div className="w-full flex items-center justify-center p-4">
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-2 top-1/2 transform -translate-y-1/2 z-10 rounded-full"
              onClick={goToPrevImage}
              disabled={images.length <= 1}
            >
              <ChevronLeft className="h-6 w-6" />
              <span className="sr-only">Previous image</span>
            </Button>
            
            <div className="w-full h-full flex items-center justify-center">
              <img
                src={images[currentIndex]}
                alt={`Gallery image ${currentIndex + 1}`}
                className="max-h-[70vh] max-w-full object-contain"
              />
            </div>
            
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 z-10 rounded-full"
              onClick={goToNextImage}
              disabled={images.length <= 1}
            >
              <ChevronRight className="h-6 w-6" />
              <span className="sr-only">Next image</span>
            </Button>
          </div>
          
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
            {images.length > 1 && images.map((_, index) => (
              <button
                key={index}
                className={`w-2 h-2 rounded-full ${
                  index === currentIndex
                    ? 'bg-primary'
                    : theme === 'dark' 
                      ? 'bg-gray-600' 
                      : 'bg-gray-300'
                }`}
                onClick={() => setCurrentIndex(index)}
                aria-label={`Go to image ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImageGallery;
