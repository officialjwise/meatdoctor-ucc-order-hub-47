
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Food } from '@/lib/storage';
import { useTheme } from '@/hooks/use-theme';

interface OrderSummaryProps {
  food: Food;
  quantity: number;
  drink: string | null;
}

const OrderSummary: React.FC<OrderSummaryProps> = ({ food, quantity, drink }) => {
  const { theme } = useTheme();
  // Calculate total price
  const totalPrice = food.price * quantity;
  
  const headerClass = theme === "dark" 
    ? "bg-gray-700 pb-2 border-gray-600" 
    : "bg-gray-50 pb-2";
  
  const cardClass = theme === "dark"
    ? "border border-gray-600"
    : "border border-gray-200";
  
  return (
    <Card className={cardClass}>
      <CardHeader className={headerClass}>
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
          <div className={theme === "dark" ? "border-t border-gray-600 pt-2 mt-2" : "border-t pt-2 mt-2"}>
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
