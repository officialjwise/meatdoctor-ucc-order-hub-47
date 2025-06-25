import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CalendarIcon, Clock, MapPin, Phone, User, Utensils, CreditCard, Plus, Minus } from 'lucide-react';
import { useTheme } from '@/hooks/use-theme';
import { showSuccessAlert, showErrorAlert, showInfoAlert } from '@/lib/alerts';
import { toast } from 'sonner';

interface FoodItem {
  id: string;
  name: string;
  price: number;
  description: string;
  image_url: string;
  category_id: string;
  categories: {
    name: string;
  } | null;
}

interface AddOn {
  name: string;
  price: number;
}

interface OrderData {
  foodId: string;
  quantity: number;
  deliveryLocation: string;
  phoneNumber: string;
  deliveryTime: string;
  paymentMode: string;
  additionalNotes: string;
  addons: string[];
}

const BACKEND_URL = 'http://localhost:3000';
const PAYSTACK_PUBLIC_KEY = 'pk_test_b2c3ae1064ed15226bdf5260ea65e70080e2f1a2';

const BookingForm = () => {
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [deliveryLocation, setDeliveryLocation] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [deliveryTime, setDeliveryTime] = useState('');
  const [paymentMode, setPaymentMode] = useState('Paystack');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [availableAddons, setAvailableAddons] = useState<AddOn[]>([]);
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { theme } = useTheme();
  const paystackRef = useRef<any>();

  useEffect(() => {
    const fetchFoodItems = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/foods`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch food items: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        setFoodItems(data);
      } catch (error: any) {
        console.error('Error fetching food items:', error);
        showErrorAlert('Error', 'Failed to load food items.');
      }
    };

    const fetchAddons = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/additional-options`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch addons: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        setAvailableAddons(data);
      } catch (error: any) {
        console.error('Error fetching addons:', error);
        showErrorAlert('Error', 'Failed to load available addons.');
      }
    };

    fetchFoodItems();
    fetchAddons();
  }, []);

  const incrementQuantity = () => {
    setQuantity(prevQuantity => prevQuantity + 1);
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(prevQuantity => prevQuantity - 1);
    }
  };

  const handleFoodSelect = (foodId: string) => {
    const selected = foodItems.find(item => item.id === foodId);
    setSelectedFood(selected || null);
  };

  const toggleAddon = (addonName: string) => {
    setSelectedAddons(prevAddons => {
      if (prevAddons.includes(addonName)) {
        return prevAddons.filter(addon => addon !== addonName);
      } else {
        return [...prevAddons, addonName];
      }
    });
  };

  const calculateTotalPrice = () => {
    if (!selectedFood) return 0;
    const foodPrice = selectedFood.price * quantity;
    const addonsPrice = selectedAddons.reduce((sum, addonName) => {
      const addon = availableAddons.find(addon => addon.name === addonName);
      return addon ? sum + addon.price : sum;
    }, 0);
    return foodPrice + addonsPrice;
  };

  const initializePaystack = async (orderData: OrderData) => {
    if (!selectedFood) {
      showErrorAlert('Error', 'Please select a food item.');
      return;
    }

    const totalPrice = calculateTotalPrice();

    const orderDetails = {
      foodId: selectedFood.id,
      quantity,
      deliveryLocation,
      phoneNumber,
      deliveryTime,
      paymentMode,
      additionalNotes,
      addons: selectedAddons,
    };

    const paystackArgs = {
      key: PAYSTACK_PUBLIC_KEY,
      email: 'customer@example.com',
      amount: totalPrice * 100,
      currency: 'GHS',
      ref: generateTransactionReference(),
      metadata: {
        orderData: JSON.stringify(orderDetails),
      },
      onSuccess: (transaction: any) => handlePaymentSuccess(transaction, orderDetails),
      onClose: () => showInfoAlert('Payment', 'Payment was not completed.'),
    };

    paystackRef.current = new (window as any).PaystackPop(paystackArgs);
    paystackRef.current.openIframe();
  };

  const generateTransactionReference = () => {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 15; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  };

  const handlePaymentSuccess = async (transaction: any, orderDetails: OrderData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/payments/initialize-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          foodId: selectedFood?.id,
          quantity,
          deliveryLocation,
          phoneNumber,
          deliveryTime,
          paymentMode,
          additionalNotes,
          addons: selectedAddons,
          totalPrice: calculateTotalPrice(),
          reference: transaction.reference,
        }),
      });

      if (!response.ok) {
        throw new Error(`Payment initialization failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Payment initialized:', data);
      showSuccessAlert('Payment Successful', 'Redirecting to payment confirmation...');
      window.location.href = `/payment-success?reference=${transaction.reference}&orderId=${data.order_id}`;
    } catch (error: any) {
      console.error('Payment initialization error:', error);
      showErrorAlert('Payment Failed', 'Unable to process payment. Please try again.');
      window.location.href = '/payment-failure';
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedFood) {
      showErrorAlert('Error', 'Please select a food item.');
      return;
    }

    if (!deliveryLocation || !phoneNumber || !deliveryTime) {
      showErrorAlert('Error', 'Please fill in all required fields.');
      return;
    }

    const orderData: OrderData = {
      foodId: selectedFood.id,
      quantity,
      deliveryLocation,
      phoneNumber,
      deliveryTime,
      paymentMode,
      additionalNotes,
      addons: selectedAddons,
    };

    if (paymentMode === 'Paystack') {
      initializePaystack(orderData);
    } else {
      setIsSubmitting(true);
      try {
        const response = await fetch(`${BACKEND_URL}/api/orders`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            foodId: selectedFood.id,
            quantity,
            deliveryLocation,
            phoneNumber,
            deliveryTime,
            paymentMode,
            additionalNotes,
            addons: selectedAddons,
            totalPrice: calculateTotalPrice(),
          }),
        });

        if (!response.ok) {
          throw new Error(`Order placement failed: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Order placed:', data);
        showSuccessAlert('Order Placed', 'Your order has been placed successfully!');
      } catch (error: any) {
        console.error('Order placement error:', error);
        showErrorAlert('Order Failed', 'Unable to place order. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl">Place Your Order</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="food">
            <Utensils className="mr-2 h-4 w-4 inline-block" />
            Select Food
          </Label>
          <Select onValueChange={handleFoodSelect}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Choose your food" />
            </SelectTrigger>
            <SelectContent>
              {foodItems.map(food => (
                <SelectItem key={food.id} value={food.id}>
                  {food.name} - GHS {food.price}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedFood && (
          <div className="border rounded-md p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">{selectedFood.name}</h3>
              <Badge variant="secondary">GHS {selectedFood.price}</Badge>
            </div>
            <Separator className="my-2" />
            <div className="flex items-center justify-between">
              <Label htmlFor="quantity">Quantity:</Label>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="icon" onClick={decrementQuantity} disabled={quantity <= 1}>
                  <Minus className="h-4 w-4" />
                </Button>
                <Input
                  type="number"
                  id="quantity"
                  value={quantity.toString()}
                  onChange={(e) => setQuantity(parseInt(e.target.value))}
                  className="w-16 text-center"
                  min="1"
                />
                <Button variant="outline" size="icon" onClick={incrementQuantity}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <Separator className="my-2" />
            <div>
              <h4 className="text-md font-semibold">Add-ons:</h4>
              <div className="flex flex-wrap gap-2">
                {availableAddons.map(addon => (
                  <Button
                    key={addon.name}
                    variant={selectedAddons.includes(addon.name) ? 'default' : 'outline'}
                    onClick={() => toggleAddon(addon.name)}
                  >
                    {addon.name} - GHS {addon.price}
                  </Button>
                ))}
              </div>
            </div>
            <Separator className="my-2" />
            <div className="text-right">
              Total Price: GHS {calculateTotalPrice()}
            </div>
          </div>
        )}

        <div className="grid gap-2">
          <Label htmlFor="deliveryLocation">
            <MapPin className="mr-2 h-4 w-4 inline-block" />
            Delivery Location
          </Label>
          <Input
            type="text"
            id="deliveryLocation"
            placeholder="Enter your delivery location"
            value={deliveryLocation}
            onChange={(e) => setDeliveryLocation(e.target.value)}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="phoneNumber">
            <Phone className="mr-2 h-4 w-4 inline-block" />
            Phone Number
          </Label>
          <Input
            type="tel"
            id="phoneNumber"
            placeholder="Enter your phone number"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="deliveryTime">
            <Clock className="mr-2 h-4 w-4 inline-block" />
            Delivery Time
          </Label>
          <Input
            type="datetime-local"
            id="deliveryTime"
            value={deliveryTime}
            onChange={(e) => setDeliveryTime(e.target.value)}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="paymentMode">
            <CreditCard className="mr-2 h-4 w-4 inline-block" />
            Payment Mode
          </Label>
          <Select onValueChange={setPaymentMode}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select payment mode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Paystack">Paystack</SelectItem>
              <SelectItem value="Cash On Delivery">Cash On Delivery</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="additionalNotes">
            <User className="mr-2 h-4 w-4 inline-block" />
            Additional Notes
          </Label>
          <Textarea
            id="additionalNotes"
            placeholder="Any additional notes?"
            value={additionalNotes}
            onChange={(e) => setAdditionalNotes(e.target.value)}
          />
        </div>
        <Button className="w-full" onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? 'Placing Order...' : 'Place Order'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default BookingForm;
