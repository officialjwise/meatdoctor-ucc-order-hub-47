
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Food } from '@/lib/storage';

interface OrderSummaryProps {
  food: Food;
  quantity: number;
  drink: string | null;
}

const OrderSummary: React.FC<OrderSummaryProps> = ({ food, quantity, drink }) => {
  // Calculate total price
  const totalPrice = food.price * quantity;
  
  return (
    <Card className="border border-gray-200">
      <CardHeader className="bg-gray-50 pb-2">
        <CardTitle className="text-lg font-medium">Order Summary</CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Food:</span>
            <span className="font-medium">{food.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Price:</span>
            <span>GHS {food.price.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Quantity:</span>
            <span>{quantity}</span>
          </div>
          {drink && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Drink:</span>
              <span>{drink}</span>
            </div>
          )}
          <div className="border-t pt-2 mt-2">
            <div className="flex justify-between font-semibold">
              <span>Total:</span>
              <span>GHS {totalPrice.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default OrderSummary;
