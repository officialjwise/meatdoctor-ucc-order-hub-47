
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, Clock, MapPin, Phone } from 'lucide-react';

interface OrderDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderData: any;
}

const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({
  isOpen,
  onClose,
  orderData
}) => {
  if (!orderData) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="bg-green-100 p-3 rounded-full">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <DialogTitle className="text-center text-xl font-bold text-green-600">
            Order Placed Successfully!
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Card>
            <CardContent className="p-4 space-y-3">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Order ID</p>
                <p className="font-mono text-lg font-semibold">{orderData.order_id}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Save this ID to track your order
                </p>
              </div>

              <div className="border-t pt-3 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Food:</span>
                  <span className="font-medium">{orderData.food?.name}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Quantity:</span>
                  <span>{orderData.quantity}</span>
                </div>

                {orderData.addons && orderData.addons.length > 0 && (
                  <div className="flex justify-between items-start">
                    <span className="text-sm text-muted-foreground">Add-ons:</span>
                    <span className="text-right">{orderData.addons.join(', ')}</span>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total:</span>
                  <span className="font-semibold text-lg">GHS {orderData.totalPrice?.toFixed(2)}</span>
                </div>
              </div>

              <div className="border-t pt-3 space-y-2">
                <div className="flex items-start space-x-2">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Delivery Location</p>
                    <p className="font-medium">{orderData.delivery_location}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-2">
                  <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Delivery Time</p>
                    <p className="font-medium">{orderData.deliveryDateTime}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-2">
                  <Phone className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Contact</p>
                    <p className="font-medium">{orderData.phone_number}</p>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                <p className="text-green-800 text-sm text-center">
                  <strong>SMS Notification Sent!</strong><br />
                  You'll receive updates about your order via SMS.
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-2">
            <Button 
              onClick={() => window.location.href = `/track-order/${orderData.order_id}`}
              className="w-full bg-food-primary hover:bg-food-primary/90"
            >
              Track Your Order
            </Button>
            <Button 
              onClick={onClose}
              variant="outline" 
              className="w-full"
            >
              Place Another Order
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OrderDetailsModal;
