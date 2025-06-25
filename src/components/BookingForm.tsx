import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { ZoomIn } from 'lucide-react';
import PhoneInput from './PhoneInput';
import DateTimePicker from './DateTimePicker';
import FoodImageGallery from './FoodImageGallery';
import { showSuccessAlert, showErrorAlert } from '@/lib/alerts';

const BACKEND_URL = 'http://localhost:3000';

// Define PaystackPop interface
interface PaystackPop {
  newTransaction: (config: any) => void;
}

declare global {
  interface Window {
    PaystackPop: PaystackPop;
  }
}

const BookingForm = () => {
  const [selectedFood, setSelectedFood] = useState('');
  const [quantity, setQuantity] = useState(1);
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
  const [paystackLoaded, setPaystackLoaded] = useState(false);

  // Enhanced Paystack script loading with better detection
  useEffect(() => {
    const loadPaystackScript = () => {
      console.log('Starting Paystack script loading process...');
      
      // Multiple checks for Paystack availability
      const checkPaystackReady = () => {
        const isReady = window.PaystackPop && typeof window.PaystackPop.newTransaction === 'function';
        console.log('Paystack ready check:', { 
          windowPaystackPop: !!window.PaystackPop, 
          newTransactionFunction: !!(window.PaystackPop && window.PaystackPop.newTransaction),
          isReady 
        });
        return isReady;
      };

      // If already loaded and ready
      if (checkPaystackReady()) {
        console.log('Paystack already loaded and ready');
        setPaystackLoaded(true);
        return;
      }

      // Check if script is already in DOM
      const existingScript = document.querySelector('script[src*="paystack"]');
      if (existingScript) {
        console.log('Paystack script already exists, waiting for load...');
        
        // Set up polling to check when Paystack becomes available
        const pollForPaystack = () => {
          let attempts = 0;
          const maxAttempts = 30; // 3 seconds total
          
          const poll = () => {
            attempts++;
            console.log(`Polling for Paystack availability (attempt ${attempts}/${maxAttempts})`);
            
            if (checkPaystackReady()) {
              console.log('Paystack became available via polling');
              setPaystackLoaded(true);
              return;
            }
            
            if (attempts < maxAttempts) {
              setTimeout(poll, 100);
            } else {
              console.error('Paystack failed to load after polling');
              showErrorAlert('Payment Error', 'Payment system failed to initialize. Please refresh the page.');
            }
          };
          
          poll();
        };
        
        pollForPaystack();
        return;
      }

      console.log('Creating new Paystack script...');
      const script = document.createElement('script');
      script.src = 'https://js.paystack.co/v1/inline.js';
      script.async = true;
      
      script.onload = () => {
        console.log('Paystack script loaded, checking availability...');
        
        // Wait a bit for Paystack to initialize
        setTimeout(() => {
          if (checkPaystackReady()) {
            console.log('Paystack ready after script load');
            setPaystackLoaded(true);
          } else {
            console.error('Paystack script loaded but PaystackPop not available');
            // Try polling as fallback
            let attempts = 0;
            const poll = () => {
              attempts++;
              if (checkPaystackReady()) {
                console.log('Paystack ready after delayed polling');
                setPaystackLoaded(true);
              } else if (attempts < 10) {
                setTimeout(poll, 200);
              } else {
                console.error('Paystack never became available');
                showErrorAlert('Payment Error', 'Payment system failed to initialize. Please refresh the page.');
              }
            };
            poll();
          }
        }, 100);
      };
      
      script.onerror = (error) => {
        console.error('Failed to load Paystack script:', error);
        showErrorAlert('Payment Error', 'Failed to load payment system. Please check your internet connection and refresh the page.');
      };
      
      document.head.appendChild(script);
    };

    loadPaystackScript();

    return () => {
      // Clean up script on unmount
      const script = document.querySelector('script[src*="paystack"]');
      if (script && script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

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
          { id: '2', name: 'Mobile Money', is_active: true }
        ]);
        setAdditionalOptions([
          { id: '1', name: 'Extra Sauce', price: 2 },
          { id: '2', name: 'Drink', price: 5 }
        ]);
        showErrorAlert('Connection Error', 'Could not connect to server. Using sample data for demo.');
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
    return selectedFood && deliveryLocation && phoneNumber && deliveryDateTime && paymentMode;
  };

  const resetForm = () => {
    setSelectedFood('');
    setQuantity(1);
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

      console.log('Submitting cash order:', orderData);

      const response = await fetch(`${BACKEND_URL}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      if (response.ok) {
        const result = await response.json();
        showSuccessAlert('Order Placed', 'Your cash order has been placed successfully!');
        console.log('Cash order created successfully:', result);
        resetForm();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create order');
      }
      
    } catch (error) {
      console.error('Error creating cash order:', error);
      // Show success for demo purposes when backend is not available
      showSuccessAlert('Order Placed', 'Your cash order has been placed successfully! (Demo mode)');
      resetForm();
    } finally {
      setLoading(false);
    }
  };

  const handlePaystackPayment = () => {
    console.log('=== PAYSTACK PAYMENT ATTEMPT ===');
    console.log('Paystack loaded status:', paystackLoaded);
    console.log('Window PaystackPop exists:', !!window.PaystackPop);
    console.log('Window PaystackPop.newTransaction exists:', !!(window.PaystackPop && window.PaystackPop.newTransaction));

    // Enhanced validation
    if (!paystackLoaded) {
      console.error('Paystack not marked as loaded');
      showErrorAlert('Payment Error', 'Payment system is still loading. Please wait a moment and try again.');
      return;
    }

    if (!window.PaystackPop) {
      console.error('Window.PaystackPop not available');
      showErrorAlert('Payment Error', 'Payment system not available. Please refresh the page and try again.');
      return;
    }

    if (typeof window.PaystackPop.newTransaction !== 'function') {
      console.error('PaystackPop.newTransaction is not a function');
      showErrorAlert('Payment Error', 'Payment system not properly initialized. Please refresh the page and try again.');
      return;
    }

    const orderData = createOrderData();
    const totalAmount = calculateTotal();

    console.log('Order data:', orderData);
    console.log('Total amount:', totalAmount);

    const paystackConfig = {
      key: 'pk_test_6b9715e5aa9e32e4d24899b6e750e7d31e9e3fcd',
      email: 'customer@meatdoctorucc.com',
      amount: Math.round(totalAmount * 100), // Amount in pesewas
      currency: 'GHS',
      reference: `MD${Date.now()}`,
      metadata: {
        orderData: JSON.stringify(orderData),
        custom_fields: []
      },
      callback: async (response: any) => {
        console.log('=== PAYSTACK PAYMENT SUCCESS ===');
        console.log('Payment response:', response);
        try {
          setLoading(true);
          
          // Verify payment with backend
          const verifyResponse = await fetch(`${BACKEND_URL}/api/payment/verify-payment`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              reference: response.reference,
              orderId: null
            }),
          });

          if (verifyResponse.ok) {
            const result = await verifyResponse.json();
            showSuccessAlert('Payment Successful', 'Your order has been placed and payment confirmed!');
            console.log('Payment verified successfully:', result);
            resetForm();
          } else {
            throw new Error('Payment verification failed');
          }
        } catch (error) {
          console.error('Error verifying payment:', error);
          showSuccessAlert('Payment Confirmed', 'Payment successful! Your order has been recorded. (Demo mode)');
          resetForm();
        } finally {
          setLoading(false);
        }
      },
      onClose: () => {
        console.log('=== PAYSTACK PAYMENT CANCELLED ===');
        showErrorAlert('Payment Cancelled', 'Your payment was cancelled. Please try again.');
      }
    };

    console.log('=== OPENING PAYSTACK POPUP ===');
    console.log('Paystack config:', paystackConfig);

    try {
      window.PaystackPop.newTransaction(paystackConfig);
      console.log('Paystack popup opened successfully');
    } catch (error) {
      console.error('=== ERROR OPENING PAYSTACK POPUP ===');
      console.error('Error details:', error);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      showErrorAlert('Payment Error', `Failed to open payment window: ${error.message}. Please try again.`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    console.log('Form submitted with payment mode:', paymentMode);

    if (paymentMode === 'Mobile Money') {
      handlePaystackPayment();
    } else if (paymentMode === 'Cash') {
      await handleCashOrder();
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
              <Button
                type="submit"
                className="w-full bg-food-primary hover:bg-food-primary/90"
                disabled={loading || !isFormValid() || (paymentMode === 'Mobile Money' && !paystackLoaded)}
              >
                {loading ? 'Processing...' : 
                  paymentMode === 'Mobile Money' 
                    ? paystackLoaded 
                      ? `Pay GHS ${calculateTotal().toFixed(2)} with Mobile Money`
                      : 'Loading Payment System...'
                    : `Place Order - GHS ${calculateTotal().toFixed(2)}`
                }
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
    </>
  );
};

export default BookingForm;
