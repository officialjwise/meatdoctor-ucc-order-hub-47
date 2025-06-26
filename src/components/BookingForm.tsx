import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { ZoomIn, Plus, Minus } from 'lucide-react';
import PhoneInput from './PhoneInput';
import DateTimePicker from './DateTimePicker';
import FoodImageGallery from './FoodImageGallery';
import OrderDetailsModal from './OrderDetailsModal';
import { showSuccessAlert, showErrorAlert } from '@/lib/alerts';

const BACKEND_URL = 'http://localhost:3000';

// Load Paystack script
const loadPaystackScript = () => {
  return new Promise<void>((resolve, reject) => {
    if (document.querySelector('script[src*="paystack"]')) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Paystack script'));
    document.head.appendChild(script);
  });
};

const BookingForm = () => {
  const [selectedFood, setSelectedFood] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [quantityError, setQuantityError] = useState('');
  const [deliveryLocation, setDeliveryLocation] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [deliveryDateTime, setDeliveryDateTime] = useState('');
  const [paymentMode, setPaymentMode] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  
  const [foods, setFoods] = useState([]);
  const [locations, setLocations] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [additionalOptions, setAdditionalOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [orderDetailsModal, setOrderDetailsModal] = useState({ open: false, orderData: null });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [foodsRes, locationsRes, paymentMethodsRes, addonsRes] = await Promise.all([
          fetch(`${BACKEND_URL}/api/public/foods`),
          fetch(`${BACKEND_URL}/api/public/locations`),
          fetch(`${BACKEND_URL}/api/public/payment-modes`),
          fetch(`${BACKEND_URL}/api/public/additional-options`)
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
        // Load fallback data when backend is not available
        setFoods([
          { id: '1', name: 'Grilled Chicken', price: 25, is_available: true, image_urls: ['https://images.unsplash.com/photo-1618160702438-9b02ab6515c9'] },
          { id: '2', name: 'Beef Stew', price: 30, is_available: true, image_urls: ['https://images.unsplash.com/photo-1721322800607-8c38375eef04'] }
        ]);
        setLocations([
          { id: '1', name: 'Campus Main Gate', is_active: true },
          { id: '2', name: 'UCC Hospital', is_active: true }
        ]);
        setPaymentMethods([
          { id: '1', name: 'Cash', is_active: true },
          { id: '2', name: 'Card', is_active: true }
        ]);
        setAdditionalOptions([
          { id: '1', name: 'Extra Sauce', price: 2 },
          { id: '2', name: 'Drink', price: 5 }
        ]);
        showErrorAlert('Connection Error', 'Could not connect to server. Using sample data for demo.');
      }
    };

    fetchData();
    loadPaystackScript().catch(console.error);
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

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity <= 0) {
      setQuantity(0);
      setQuantityError('0 is not allowed');
    } else {
      setQuantity(newQuantity);
      setQuantityError('');
    }
  };

  const incrementQuantity = () => {
    handleQuantityChange(quantity + 1);
  };

  const decrementQuantity = () => {
    handleQuantityChange(quantity - 1);
  };

  const handleAddonChange = (addonName: string, checked: boolean) => {
    if (checked) {
      setSelectedAddons([...selectedAddons, addonName]);
    } else {
      setSelectedAddons(selectedAddons.filter(name => name !== addonName));
    }
  };

  const validateForm = () => {
    if (!selectedFood) {
      showErrorAlert('Validation Error', 'Please select a food item.');
      return false;
    }
    if (quantity <= 0) {
      showErrorAlert('Validation Error', 'Quantity must be greater than 0.');
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
    if (!deliveryDateTime) {
      showErrorAlert('Validation Error', 'Please select delivery date and time.');
      return false;
    }
    if (!paymentMode) {
      showErrorAlert('Validation Error', 'Please select a payment method.');
      return false;
    }
    return true;
  };

  const isFormValid = () => {
    return selectedFood && deliveryLocation && phoneNumber && deliveryDateTime && paymentMode && quantity > 0;
  };

  const resetForm = () => {
    setSelectedFood('');
    setQuantity(1);
    setQuantityError('');
    setDeliveryLocation('');
    setPhoneNumber('');
    setDeliveryDateTime('');
    setPaymentMode('');
    setAdditionalNotes('');
    setSelectedAddons([]);
  };

  const createOrderData = () => {
    return {
      foodId: selectedFood,
      quantity,
      deliveryLocation,
      phoneNumber,
      deliveryTime: new Date(deliveryDateTime).toISOString(),
      paymentMode,
      additionalNotes,
      addons: selectedAddons,
    };
  };

  const handleCashOrder = async () => {
    try {
      setLoading(true);
      const orderData = createOrderData();

      const response = await fetch(`${BACKEND_URL}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      if (response.ok) {
        const result = await response.json();
        const food = getSelectedFood();
        
        const orderDetails = {
          ...result,
          food: food,
          totalPrice: calculateTotal(),
          addons: selectedAddons,
          deliveryDateTime: new Date(deliveryDateTime).toLocaleString()
        };

        setOrderDetailsModal({ open: true, orderData: orderDetails });
        resetForm();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create order');
      }
    } catch (error) {
      showErrorAlert('Order Failed', 'Unable to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePaystackPayment = async () => {
    try {
      setLoading(true);
      
      if (!window.PaystackPop) {
        throw new Error('Paystack not loaded');
      }

      const orderData = createOrderData();
      const totalAmount = calculateTotal();
      
      const publicKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || 'pk_test_b2c3ae1064ed15226bdf5260ea65e70080e2f1a2';
      
      const handler = window.PaystackPop.setup({
        key: publicKey,
        email: 'customer@email.com',
        amount: totalAmount * 100,
        currency: 'GHS',
        ref: `MD_${Date.now()}`,
        metadata: {
          orderData: JSON.stringify(orderData)
        },
        callback: function(response: any) {
          handlePaymentVerification(response.reference, orderData);
        },
        onClose: function() {
          setLoading(false);
        }
      });

      handler.openIframe();
    } catch (error) {
      showErrorAlert('Payment Error', 'Unable to initialize payment. Please try again.');
      setLoading(false);
    }
  };

  const handlePaymentVerification = async (reference: string, orderData: any) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/payments/verify-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reference, orderId: orderData.foodId }),
      });

      if (response.ok) {
        const result = await response.json();
        const food = getSelectedFood();
        
        const orderDetails = {
          ...result,
          food: food,
          totalPrice: calculateTotal(),
          addons: selectedAddons,
          deliveryDateTime: new Date(deliveryDateTime).toLocaleString()
        };

        setOrderDetailsModal({ open: true, orderData: orderDetails });
        resetForm();
        setLoading(false);
      } else {
        throw new Error('Payment verification failed');
      }
    } catch (error) {
      showErrorAlert('Payment Verification Failed', 'Payment was successful but verification failed. Please contact support.');
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    if (paymentMode === 'Cash') {
      await handleCashOrder();
    } else {
      await handlePaystackPayment();
    }
  };

  const selectedFoodData = getSelectedFood();

  return (
    <>
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

            {/* Food Image Display */}
            {selectedFoodData && selectedFoodData.image_urls && selectedFoodData.image_urls.length > 0 && (
              <div className="space-y-2">
                <Label>Selected Food</Label>
                <div className="flex items-center space-x-4 p-4 border rounded-lg">
                  <div className="relative group cursor-pointer" onClick={() => setGalleryOpen(true)}>
                    <img 
                      src={selectedFoodData.image_urls[0]} 
                      alt={selectedFoodData.name}
                      className="w-32 h-32 object-cover rounded-md transition-transform group-hover:scale-105"
                      onError={(e) => {
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9';
                      }}
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-md flex items-center justify-center">
                      <ZoomIn className="h-6 w-6 text-white" />
                    </div>
                    {selectedFoodData.image_urls.length > 1 && (
                      <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                        +{selectedFoodData.image_urls.length - 1}
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{selectedFoodData.name}</h3>
                    <p className="text-muted-foreground text-lg">GHS {selectedFoodData.price}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Click image to view {selectedFoodData.image_urls.length > 1 ? 'gallery' : 'larger version'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Quantity with Plus/Minus buttons */}
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity *</Label>
              <div className="flex items-center space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={decrementQuantity}
                  className="h-10 w-10"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <Input
                  id="quantity"
                  type="number"
                  value={quantity}
                  onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 0)}
                  className="w-20 text-center"
                  min="1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={incrementQuantity}
                  className="h-10 w-10"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {quantityError && (
                <p className="text-sm text-red-500 mt-1">{quantityError}</p>
              )}
            </div>

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
            <PhoneInput value={phoneNumber} onChange={setPhoneNumber} />

            {/* Delivery Date and Time */}
            <div className="space-y-2">
              <Label htmlFor="datetime">Delivery Date & Time *</Label>
              <DateTimePicker
                value={deliveryDateTime}
                onChange={setDeliveryDateTime}
                placeholder="Select delivery date and time"
              />
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
            {selectedFood && quantity > 0 && (
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
              <Button
                type="submit"
                className="w-full bg-food-primary hover:bg-food-primary/90"
                disabled={loading || !isFormValid()}
              >
                {loading ? 'Processing...' : `Place Order - GHS ${calculateTotal().toFixed(2)}`}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Image Gallery Modal */}
      <FoodImageGallery
        images={selectedFoodData?.image_urls || []}
        foodName={selectedFoodData?.name || ''}
        isOpen={galleryOpen}
        onClose={() => setGalleryOpen(false)}
        initialIndex={0}
      />

      {/* Order Details Modal */}
      <OrderDetailsModal
        isOpen={orderDetailsModal.open}
        onClose={() => setOrderDetailsModal({ open: false, orderData: null })}
        orderData={orderDetailsModal.orderData}
      />
    </>
  );
};

export default BookingForm;
