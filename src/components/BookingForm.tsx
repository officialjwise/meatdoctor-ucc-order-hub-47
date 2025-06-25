import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarIcon, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import PhoneInput from './PhoneInput';
import { showSuccessAlert, showErrorAlert } from '@/lib/alerts';
import { PaystackButton } from 'react-paystack';

const BACKEND_URL = 'http://localhost:3000';

const BookingForm = () => {
  const [selectedFood, setSelectedFood] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [deliveryLocation, setDeliveryLocation] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [deliveryDate, setDeliveryDate] = useState<Date>();
  const [deliveryTime, setDeliveryTime] = useState('');
  const [paymentMode, setPaymentMode] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  
  const [foods, setFoods] = useState([]);
  const [locations, setLocations] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [additionalOptions, setAdditionalOptions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [foodsRes, locationsRes, paymentMethodsRes, addonsRes] = await Promise.all([
          fetch(`${BACKEND_URL}/api/foods`),
          fetch(`${BACKEND_URL}/api/locations`),
          fetch(`${BACKEND_URL}/api/payment-methods`),
          fetch(`${BACKEND_URL}/api/additional-options`)
        ]);

        if (foodsRes.ok) {
          const foodsData = await foodsRes.json();
          setFoods(foodsData.filter((food: any) => food.is_available));
        }

        if (locationsRes.ok) {
          const locationsData = await locationsRes.json();
          setLocations(locationsData.filter((location: any) => location.is_active));
        }

        if (paymentMethodsRes.ok) {
          const paymentMethodsData = await paymentMethodsRes.json();
          setPaymentMethods(paymentMethodsData.filter((method: any) => method.is_active));
        }

        if (addonsRes.ok) {
          const addonsData = await addonsRes.json();
          setAdditionalOptions(addonsData);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        showErrorAlert('Error', 'Failed to load form data. Please refresh the page.');
      }
    };

    fetchData();
  }, []);

  const getSelectedFood = () => {
    return foods.find((food: any) => food.id === selectedFood);
  };

  const calculateTotal = () => {
    const food = getSelectedFood();
    if (!food) return 0;
    
    const foodTotal = food.price * quantity;
    const addonsTotal = selectedAddons.reduce((total, addonName) => {
      const addon = additionalOptions.find((option: any) => option.name === addonName);
      return total + (addon ? addon.price : 0);
    }, 0);
    
    return foodTotal + addonsTotal;
  };

  const handleAddonChange = (addonName: string, checked: boolean) => {
    if (checked) {
      setSelectedAddons([...selectedAddons, addonName]);
    } else {
      setSelectedAddons(selectedAddons.filter(name => name !== addonName));
    }
  };

  const handlePaystackSuccess = async (reference: any) => {
    try {
      setLoading(true);
      
      // Redirect to payment success page with reference
      window.location.href = `/payment-success?reference=${reference.reference}`;
      
    } catch (error) {
      console.error('Error handling payment success:', error);
      showErrorAlert('Error', 'Payment successful but failed to process. Please contact support.');
    } finally {
      setLoading(false);
    }
  };

  const handlePaystackClose = () => {
    showErrorAlert('Payment Cancelled', 'Your payment was cancelled. Please try again.');
  };

  const validateForm = () => {
    if (!selectedFood) {
      showErrorAlert('Validation Error', 'Please select a food item.');
      return false;
    }
    if (!deliveryLocation) {
      showErrorAlert('Validation Error', 'Please select a delivery location.');
      return false;
    }
    if (!phoneNumber) {
      showErrorAlert('Validation Error', 'Please enter your phone number.');
      return false;
    }
    if (!deliveryDate || !deliveryTime) {
      showErrorAlert('Validation Error', 'Please select delivery date and time.');
      return false;
    }
    if (!paymentMode) {
      showErrorAlert('Validation Error', 'Please select a payment method.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const food = getSelectedFood();
    if (!food) return;

    // For cash payment, create order directly
    if (paymentMode === 'Cash') {
      try {
        setLoading(true);
        
        const deliveryDateTime = new Date(deliveryDate!);
        const [hours, minutes] = deliveryTime.split(':');
        deliveryDateTime.setHours(parseInt(hours), parseInt(minutes));

        const orderData = {
          foodId: selectedFood,
          quantity,
          deliveryLocation,
          phoneNumber,
          deliveryTime: deliveryDateTime.toISOString(),
          paymentMode,
          additionalNotes,
          addons: selectedAddons,
        };

        const response = await fetch(`${BACKEND_URL}/api/orders`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(orderData),
        });

        if (!response.ok) {
          throw new Error('Failed to create order');
        }

        const result = await response.json();
        showSuccessAlert('Order Placed', 'Your order has been placed successfully!');
        
        // Reset form
        setSelectedFood('');
        setQuantity(1);
        setDeliveryLocation('');
        setPhoneNumber('');
        setDeliveryDate(undefined);
        setDeliveryTime('');
        setPaymentMode('');
        setAdditionalNotes('');
        setSelectedAddons([]);
        
      } catch (error) {
        console.error('Error creating order:', error);
        showErrorAlert('Error', 'Failed to place order. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  const createPaystackConfig = () => {
    const food = getSelectedFood();
    if (!food) return null;

    const deliveryDateTime = new Date(deliveryDate!);
    const [hours, minutes] = deliveryTime.split(':');
    deliveryDateTime.setHours(parseInt(hours), parseInt(minutes));

    const orderData = {
      foodId: selectedFood,
      quantity,
      deliveryLocation,
      phoneNumber,
      deliveryTime: deliveryDateTime.toISOString(),
      paymentMode,
      additionalNotes,
      addons: selectedAddons,
    };

    return {
      reference: new Date().getTime().toString(),
      email: 'customer@meatdoctorucc.com',
      amount: Math.round(calculateTotal() * 100),
      publicKey: 'pk_test_6b9715e5aa9e32e4d24899b6e750e7d31e9e3fcd',
      metadata: {
        orderData: JSON.stringify(orderData)
      }
    };
  };

  const paystackConfig = createPaystackConfig();

  return (
    <Card className="w-full max-w-2xl mx-auto backdrop-blur-sm bg-background/95 dark:bg-background/95 border border-border/50">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">Place Your Order</CardTitle>
        <CardDescription className="text-center">
          Fill in the details below to place your food order
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Food Selection */}
          <div className="space-y-2">
            <Label htmlFor="food">Select Food *</Label>
            <Select value={selectedFood} onValueChange={setSelectedFood}>
              <SelectTrigger>
                <SelectValue placeholder="Choose your food" />
              </SelectTrigger>
              <SelectContent>
                {foods.map((food: any) => (
                  <SelectItem key={food.id} value={food.id}>
                    {food.name} - GHS {food.price}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Quantity */}
          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity *</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
              className="w-full"
            />
          </div>

          {/* Additional Options */}
          {additionalOptions.length > 0 && (
            <div className="space-y-3">
              <Label>Additional Options</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {additionalOptions.map((option: any) => (
                  <div key={option.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={option.name}
                      checked={selectedAddons.includes(option.name)}
                      onCheckedChange={(checked) => handleAddonChange(option.name, checked as boolean)}
                    />
                    <Label htmlFor={option.name} className="text-sm">
                      {option.name} (+GHS {option.price})
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Delivery Location */}
          <div className="space-y-2">
            <Label htmlFor="location">Delivery Location *</Label>
            <Select value={deliveryLocation} onValueChange={setDeliveryLocation}>
              <SelectTrigger>
                <SelectValue placeholder="Select delivery location" />
              </SelectTrigger>
              <SelectContent>
                {locations.map((location: any) => (
                  <SelectItem key={location.id} value={location.name}>
                    {location.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Phone Number */}
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number *</Label>
            <PhoneInput value={phoneNumber} onChange={setPhoneNumber} />
          </div>

          {/* Delivery Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Delivery Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !deliveryDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {deliveryDate ? format(deliveryDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={deliveryDate}
                    onSelect={setDeliveryDate}
                    disabled={(date) => date < new Date()}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="time">Delivery Time *</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="time"
                  type="time"
                  value={deliveryTime}
                  onChange={(e) => setDeliveryTime(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="space-y-2">
            <Label htmlFor="payment">Payment Method *</Label>
            <Select value={paymentMode} onValueChange={setPaymentMode}>
              <SelectTrigger>
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                {paymentMethods.map((method: any) => (
                  <SelectItem key={method.id} value={method.name}>
                    {method.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Additional Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              placeholder="Any special instructions for your order..."
              rows={3}
            />
          </div>

          {/* Order Summary */}
          {selectedFood && (
            <div className="bg-muted/50 p-4 rounded-lg space-y-2">
              <h3 className="font-semibold">Order Summary</h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>{getSelectedFood()?.name} × {quantity}</span>
                  <span>GHS {((getSelectedFood()?.price || 0) * quantity).toFixed(2)}</span>
                </div>
                {selectedAddons.map(addonName => {
                  const addon = additionalOptions.find((option: any) => option.name === addonName);
                  return (
                    <div key={addonName} className="flex justify-between">
                      <span>{addonName}</span>
                      <span>GHS {addon?.price.toFixed(2)}</span>
                    </div>
                  );
                })}
                <div className="border-t pt-2 flex justify-between font-semibold">
                  <span>Total</span>
                  <span>GHS {calculateTotal().toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-4">
            {paymentMode === 'Mobile Money' && paystackConfig ? (
              <PaystackButton
                {...paystackConfig}
                text={`Pay GHS ${calculateTotal().toFixed(2)} with Mobile Money`}
                onSuccess={handlePaystackSuccess}
                onClose={handlePaystackClose}
                className="w-full bg-food-primary hover:bg-food-primary/90 text-white py-3 px-4 rounded-md font-medium transition-colors disabled:opacity-50"
                disabled={loading || !validateForm()}
              />
            ) : (
              <Button
                type="submit"
                className="w-full bg-food-primary hover:bg-food-primary/90"
                disabled={loading}
              >
                {loading ? 'Processing...' : `Place Order - GHS ${calculateTotal().toFixed(2)}`}
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default BookingForm;
