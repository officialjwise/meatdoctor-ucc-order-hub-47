
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, Clock, MapPin, Utensils, Plus } from 'lucide-react';
import { showSuccessAlert, showErrorAlert } from '@/lib/alerts';
import PhoneNumberInput from './PhoneNumberInput';

import { Food, Location, PaymentMethod } from '@/lib/types';

interface AddonOptions {
  id: string;
  name: string;
  price: number;
  type: string;
}

const BookingForm = () => {
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [deliveryLocation, setDeliveryLocation] = useState<string>('');
  const [deliveryTime, setDeliveryTime] = useState<string>('');
  const [paymentMode, setPaymentMode] = useState<string>('Cash on Delivery');
  const [additionalNotes, setAdditionalNotes] = useState<string>('');
  const [availableAddons, setAvailableAddons] = useState<AddonOptions[]>([]);
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [drink, setDrink] = useState<string>('');
  const [foods, setFoods] = useState<Food[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [phoneNumber, setPhoneNumber] = useState<string>('');

  useEffect(() => {
    const fetchFoods = async () => {
      try {
        const response = await fetch('/api/foods');
        if (response.ok) {
          const data = await response.json();
          setFoods(data || []);
        }
      } catch (error) {
        console.error('Error fetching foods:', error);
      }
    };

    const fetchLocations = async () => {
      try {
        const response = await fetch('/api/locations');
        if (response.ok) {
          const data = await response.json();
          setLocations(data || []);
        }
      } catch (error) {
        console.error('Error fetching locations:', error);
      }
    };

    const fetchPaymentMethods = async () => {
      try {
        const response = await fetch('/api/payment-methods');
        if (response.ok) {
          const data = await response.json();
          setPaymentMethods(data || []);
        }
      } catch (error) {
        console.error('Error fetching payment methods:', error);
      }
    };

    const fetchAddons = async () => {
      try {
        const response = await fetch('/api/additional-options');
        if (response.ok) {
          const data = await response.json();
          setAvailableAddons(data || []);
        }
      } catch (error) {
        console.error('Error fetching addons:', error);
      }
    };

    fetchFoods();
    fetchLocations();
    fetchPaymentMethods();
    fetchAddons();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFood) {
      showErrorAlert('Error', 'Please select a food item');
      return;
    }

    if (!phoneNumber || !phoneNumber.startsWith('+233')) {
      showErrorAlert('Error', 'Please enter a valid Ghana phone number');
      return;
    }

    if (!deliveryLocation) {
      showErrorAlert('Error', 'Please select a delivery location');
      return;
    }

    if (!deliveryTime) {
      showErrorAlert('Error', 'Please select a delivery time');
      return;
    }

    const orderData = {
      foodId: selectedFood.id,
      quantity,
      deliveryLocation,
      phoneNumber,
      deliveryTime,
      paymentMode,
      additionalNotes,
      addons: selectedAddons,
      drink,
    };

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      if (response.ok) {
        const result = await response.json();
        showSuccessAlert('Order Placed', `Your order has been placed successfully! Order ID: ${result.order_id}`);
      } else {
        const errorData = await response.json();
        showErrorAlert('Error', errorData.message || 'Failed to place order');
      }
    } catch (error: any) {
      console.error('Error placing order:', error);
      showErrorAlert('Error', error.message || 'Failed to place order');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Place Your Order</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Food Selection */}
            <div className="space-y-4">
              <Label className="text-lg font-semibold flex items-center gap-2">
                <Utensils className="h-5 w-5" />
                Select Food Item *
              </Label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {foods.map((food) => (
                  <Card
                    key={food.id}
                    className={`cursor-pointer hover:shadow-md transition-shadow duration-300 ${selectedFood?.id === food.id ? 'ring-2 ring-food-primary' : ''}`}
                    onClick={() => setSelectedFood(food)}
                  >
                    <CardContent className="flex flex-col items-center justify-center p-4">
                      <img
                        src={food.image_urls?.[0] || '/placeholder-image.jpg'}
                        alt={food.name}
                        className="w-24 h-24 object-cover rounded-md mb-2"
                      />
                      <div className="text-center">
                        <p className="text-sm font-medium">{food.name}</p>
                        <p className="text-xs text-gray-500">GHS {food.price}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div className="space-y-2">
              <Label htmlFor="quantity" className="text-sm font-medium">
                Quantity *
              </Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={quantity.toString()}
                onChange={(e) => setQuantity(parseInt(e.target.value))}
                className="dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                required
              />
            </div>

            {/* Addons - Back to original checkbox implementation */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Additional Options
                {selectedAddons.length > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {selectedAddons.length} Selected
                  </Badge>
                )}
              </Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {availableAddons.map((addon) => (
                  <div key={addon.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={addon.id}
                      checked={selectedAddons.includes(addon.name)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedAddons([...selectedAddons, addon.name]);
                        } else {
                          setSelectedAddons(selectedAddons.filter((name) => name !== addon.name));
                        }
                      }}
                    />
                    <Label
                      htmlFor={addon.id}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {addon.name} (+GHS {addon.price})
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Drink */}
            <div className="space-y-2">
              <Label htmlFor="drink" className="text-sm font-medium">
                Drink
              </Label>
              <Input
                type="text"
                id="drink"
                placeholder="Enter your preferred drink"
                value={drink}
                onChange={(e) => setDrink(e.target.value)}
                className="dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              />
            </div>

            {/* Phone Number - Using the new PhoneNumberInput component */}
            <PhoneNumberInput
              value={phoneNumber}
              onChange={setPhoneNumber}
              required
            />

            {/* Delivery Location */}
            <div className="space-y-2">
              <Label htmlFor="location" className="text-sm font-medium flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Delivery Location *
              </Label>
              <Select value={deliveryLocation} onValueChange={setDeliveryLocation} required>
                <SelectTrigger className="dark:bg-gray-800 dark:border-gray-600">
                  <SelectValue placeholder="Select delivery location" />
                </SelectTrigger>
                <SelectContent>
                  {locations.map((location) => (
                    <SelectItem key={location.id} value={location.name}>
                      {location.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Delivery Time - With improved calendar icon visibility */}
            <div className="space-y-2">
              <Label htmlFor="deliveryTime" className="text-sm font-medium flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" />
                Delivery Date & Time *
              </Label>
              <Input
                id="deliveryTime"
                type="datetime-local"
                value={deliveryTime}
                onChange={(e) => setDeliveryTime(e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
                className="dark:bg-gray-800 dark:border-gray-600 dark:text-white [&::-webkit-calendar-picker-indicator]:dark:filter [&::-webkit-calendar-picker-indicator]:dark:invert [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-80 hover:[&::-webkit-calendar-picker-indicator]:opacity-100 [&::-webkit-calendar-picker-indicator]:w-5 [&::-webkit-calendar-picker-indicator]:h-5"
                required
              />
            </div>

            {/* Payment Mode */}
            <div className="space-y-2">
              <Label htmlFor="paymentMode" className="text-sm font-medium flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Payment Mode *
              </Label>
              <Select value={paymentMode} onValueChange={setPaymentMode} required>
                <SelectTrigger className="dark:bg-gray-800 dark:border-gray-600">
                  <SelectValue placeholder="Select payment mode" />
                </SelectTrigger>
                <SelectContent>
                  {paymentMethods.map((method) => (
                    <SelectItem key={method.id} value={method.name}>
                      {method.name}
                    </SelectItem>
                  ))}
                  <SelectItem value="Cash on Delivery">Cash on Delivery</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Additional Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes" className="text-sm font-medium">
                Additional Notes
              </Label>
              <Textarea
                id="notes"
                placeholder="Any specific requests?"
                value={additionalNotes}
                onChange={(e) => setAdditionalNotes(e.target.value)}
                className="dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              />
            </div>

            {/* Order Summary */}
            <div className="space-y-4 border-t pt-4">
              <h3 className="text-lg font-semibold">Order Summary</h3>
              <p>
                <span className="font-medium">Food:</span> {selectedFood?.name}
              </p>
              <p>
                <span className="font-medium">Quantity:</span> {quantity}
              </p>
              {selectedAddons.length > 0 && (
                <p>
                  <span className="font-medium">Addons:</span> {selectedAddons.join(', ')}
                </p>
              )}
              {drink && (
                <p>
                  <span className="font-medium">Drink:</span> {drink}
                </p>
              )}
              <p>
                <span className="font-medium">Delivery Location:</span> {deliveryLocation}
              </p>
              <p>
                <span className="font-medium">Delivery Time:</span> {deliveryTime}
              </p>
              <p>
                <span className="font-medium">Payment Mode:</span> {paymentMode}
              </p>
            </div>

            {/* Submit Button */}
            <Button type="submit" className="w-full bg-food-primary hover:bg-food-primary/90">
              Place Order
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default BookingForm;
