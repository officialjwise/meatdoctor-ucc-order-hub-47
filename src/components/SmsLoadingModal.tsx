
import React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import LoadingSpinner from '@/components/LoadingSpinner';

interface SmsLoadingModalProps {
  isOpen: boolean;
  message?: string;
}

const SmsLoadingModal: React.FC<SmsLoadingModalProps> = ({ 
  isOpen, 
  message = "Sending SMS..." 
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md [&>button]:hidden">
        <div className="flex flex-col items-center justify-center p-6 space-y-4">
          <LoadingSpinner size="lg" className="text-food-primary" />
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Processing Your Order
            </h3>
            <p className="text-gray-600">{message}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SmsLoadingModal;
