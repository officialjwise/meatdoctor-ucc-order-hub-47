
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
  console.log('SmsLoadingModal render - isOpen:', isOpen, 'message:', message);
  
  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md [&>button]:hidden bg-white">
        <div className="flex flex-col items-center justify-center p-8 space-y-6">
          <LoadingSpinner size="lg" className="text-food-primary" />
          <div className="text-center">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Processing Your Order
            </h3>
            <p className="text-gray-600 text-lg">{message}</p>
            <p className="text-sm text-gray-500 mt-2">Please wait...</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SmsLoadingModal;
