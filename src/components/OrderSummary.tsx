import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTheme } from '@/hooks/use-theme';

// Define the Food interface locally
interface Food {
  name: string;
  price: number;
}

interface OrderSummaryProps {
  food: Food;
  quantity: number;
  addons: string[] | null;
  addonPrices: Record<string, number>;
}

const OrderSummary: React.FC<OrderSummaryProps> = ({ food, quantity, addons, addonPrices }) => {
  const { theme } = useTheme();
  // Calculate total price
  const foodTotal = food.price * quantity;
  const addonsTotal = (addons || []).reduce((sum, addonName) => {
    return sum + (addonPrices[addonName] || 0);
  }, 0);
  const totalPrice = foodTotal + addonsTotal;
  
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
          {(addons || []).length > 0 && (
            <>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Addons:</span>
                <span>{addons.join(', ')}</span>
              </div>
              {(addons || []).map((addonName) => (
                <div key={addonName} className="flex justify-between">
                  <span className="text-muted-foreground">{addonName} Price:</span>
                  <span>GHS {(addonPrices[addonName] || 0).toFixed(2)}</span>
                </div>
              ))}
            </>
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