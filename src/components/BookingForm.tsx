import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { 
  validateBookingForm, 
  BookingFormData, 
  ValidationResult, 
  formatGhanaPhone 
} from '@/lib/validation';
import OrderSummary from './OrderSummary';
import { useTheme } from '@/hooks/use-theme';
import ImageGallery from './ImageGallery';
import { showSuccessAlert, showErrorAlert } from '@/lib/alerts';

// Hardcoded drink options (can be fetched from backend later if needed)
const drinkOptions = ['Fresh Yogurt', 'Soda', 'Water'];

const BookingForm = () => {
  const { theme } = useTheme();
  const [formData, setFormData] = useState<BookingFormData>({
    foodId: 0,
    price: 0,
    quantity: 1,
    drink: null,
    paymentMode: 'Mobile Money',
    location: '',
    additionalInfo: '',
    phoneNumber: '',
    deliveryTime: ''
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [selectedFood, setSelectedFood] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  
  const [foodItems, setFoodItems] = useState<any[]>([]);
  const [locationItems] = useState([
    { name: 'UCC New Site', active: true },
    { name: 'UCC Old Site', active: true },
    { name: 'Cape Coast Central', active: true }
  ]);
  const [paymentModeItems] = useState([
    { name: 'Mobile Money', active: true },
    { name: 'Cash on Delivery', active: true }
  ]);
  const [availableLocations, setAvailableLocations] = useState<string[]>([]);
  const [availablePaymentModes, setAvailablePaymentModes] = useState<string[]>([]);
  const selectTriggerRef = useRef<HTMLButtonElement | null>(null);
  
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  
  useEffect(() => {
    // Fetch food items from backend
    const fetchFoods = async () => {
      try {
        const response = await fetch('/api/foods', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch food items');
        }

        const foods = await response.json();
        setFoodItems(foods.filter((food: any) => food.active));
      } catch (err) {
        console.error('Error fetching food items:', err);
        showErrorAlert('Error', 'Failed to load food items. Please try again later.');
      }
    };

    fetchFoods();

    // Set available locations and payment modes
    setAvailableLocations(locationItems
      .filter(loc => loc.active)
      .map(loc => loc.name)
    );
    
    setAvailablePaymentModes(paymentModeItems
      .filter(mode => mode.active)
      .map(mode => mode.name)
    );
  }, []);

  useEffect(() => {
    if (formData.foodId) {
      const food = foodItems.find(f => f.id === formData.foodId);
      if (food) {
        // Automatically set the price from the food item
        setFormData(prev => ({ ...prev, price: food.price }));
        setSelectedFood(food);
        
        if (food.image_url) {
          setGalleryImages([food.image_url]);
        } else {
          setGalleryImages([]);
        }
      }
    }
  }, [formData.foodId, foodItems]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSelectChange = (name: string, value: string | number) => {
    const processedValue = ['foodId', 'price', 'quantity'].includes(name) ? Number(value) : value;
    
    setFormData(prev => ({ ...prev, [name]: processedValue }));
    
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = parseInt(e.target.value);
    if (isNaN(value)) value = 1;
    if (value < 1) value = 1;
    if (value > 10) value = 10;
    
    setFormData(prev => ({ ...prev, quantity: value }));
    
    if (errors.quantity) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.quantity;
        return newErrors;
      });
    }
  };

  const handleDrinkChange = (drink: string) => {
    setFormData(prev => ({
      ...prev,
      drink: prev.drink === drink ? null : drink
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validation: ValidationResult = validateBookingForm(formData);
    
    if (!validation.valid) {
      setErrors(validation.errors);
      showErrorAlert('Validation Error', 'Please check the form for errors.');
      return;
    }
    
    setLoading(true);
    
    try {
      const orderData = {
        foodId: formData.foodId.toString(),
        quantity: formData.quantity,
        deliveryLocation: formData.location,
        phoneNumber: formatGhanaPhone(formData.phoneNumber),
        deliveryTime: new Date(formData.deliveryTime).toISOString(),
        orderStatus: 'Pending',
        paymentMode: formData.paymentMode,
        additionalNotes: formData.additionalInfo,
        drink: formData.drink
      };

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        throw new Error('Failed to place order');
      }

      const order = await response.json();
      setOrderId(order.order_id);
      setShowConfirmation(true);
      
      // SMS notification is handled by the backend
      console.log('Order submitted:', order);

      setLoading(false);
    } catch (error) {
      console.error('Error saving booking:', error);
      showErrorAlert('Order Error', 'An error occurred while processing your order. Please try again.');
      setLoading(false);
    }
  };

  const handleCloseConfirmation = () => {
    setShowConfirmation(false);
    
    setFormData({
      foodId: 0,
      price: 0,
      quantity: 1,
      drink: null,
      paymentMode: 'Mobile Money',
      location: '',
      additionalInfo: '',
      phoneNumber: '',
      deliveryTime: ''
    });
    setSelectedFood(null);
  };

  const openGallery = () => {
    if (galleryImages.length > 0) {
      setGalleryOpen(true);
    }
  };

  const formClasses = theme === "dark" 
    ? "space-y-6 bg-gray-800/95 backdrop-blur-sm p-6 rounded-lg shadow-lg border-2 border-gray-600 text-white order-form" 
    : "space-y-6 bg-white/90 backdrop-blur-sm p-6 rounded-lg shadow-lg";

  return (
    <div className="w-full max-w-3xl mx-auto">
      <form onSubmit={handleSubmit} className={formClasses}>
        <h2 className="text-2xl font-bold">Order Form</h2>
        
        <div className="space-y-2 relative z-30">
          <Label htmlFor="foodId" className={theme === "dark" ? "form-label" : ""}>Select Food</Label>
          <div className="relative">
            <Select
              value={formData.foodId.toString() || "0"}
              onValueChange={(value) => handleSelectChange('foodId', value)}
            >
              <SelectTrigger
                id="foodId"
                aria-label="Select food"
                className={theme === "dark" ? "bg-gray-900 border-gray-700" : ""}
                ref={selectTriggerRef}
              >
                <SelectValue placeholder="Select food" />
              </SelectTrigger>
              <SelectContent>
                {foodItems.length === 0 ? (
                  <SelectItem value="0" disabled>No food items available</SelectItem>
                ) : (
                  foodItems.map((food) => (
                    <SelectItem key={food.id} value={food.id}>
                      <div className="flex items-center gap-2">
                        {food.image_url &&
                          <img src={food.image_url} alt={food.name} className="h-7 w-7 object-cover rounded mr-1 border" />
                        }
                        <span>{food.name} (GHS {food.price})</span>
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
          {errors.foodId && <p className="text-red-500 text-sm">{errors.foodId}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="price">Price (GHS)</Label>
          <Input
            id="price"
            name="price"
            type="number"
            value={formData.price}
            onChange={handleInputChange}
            readOnly
            className={theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-gray-100"}
            aria-label="Food price"
          />
          {errors.price && <p className="text-red-500 text-sm">{errors.price}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="quantity">Quantity</Label>
          <Input
            id="quantity"
            name="quantity"
            type="number"
            min="1"
            max="10"
            value={formData.quantity}
            onChange={handleQuantityChange}
            aria-label="Quantity"
            className={theme === "dark" ? "bg-gray-900 border-gray-700 text-white" : ""}
          />
          {errors.quantity && <p className="text-red-500 text-sm">{errors.quantity}</p>}
        </div>

        <div className="space-y-2">
          <Label>Add a Drink (Optional)</Label>
          <div className="flex flex-wrap gap-4">
            {drinkOptions.map((drink) => (
              <div key={drink} className="flex items-center space-x-2">
                <Checkbox
                  id={`drink-${drink}`}
                  checked={formData.drink === drink}
                  onCheckedChange={() => handleDrinkChange(drink)}
                  aria-label={`Add ${drink}`}
                />
                <Label htmlFor={`drink-${drink}`} className="cursor-pointer">
                  {drink}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Payment Mode</Label>
          <RadioGroup
            value={formData.paymentMode}
            onValueChange={(value) => handleSelectChange('paymentMode', value as string)}
            className="flex flex-col space-y-2"
          >
            {availablePaymentModes.length === 0 ? (
              <div className="text-sm text-muted-foreground">No payment modes available</div>
            ) : (
              availablePaymentModes.map((mode) => (
                <div key={mode} className="flex items-center space-x-2">
                  <RadioGroupItem value={mode} id={`payment-${mode}`} />
                  <Label htmlFor={`payment-${mode}`}>{mode}</Label>
                </div>
              ))
            )}
          </RadioGroup>
          {errors.paymentMode && <p className="text-red-500 text-sm">{errors.paymentMode}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">Select Location</Label>
          <Select
            value={formData.location}
            onValueChange={(value) => handleSelectChange('location', value)}
          >
            <SelectTrigger id="location" aria-label="Select location" className={theme === "dark" ? "bg-gray-900 border-gray-700" : ""}>
              <SelectValue placeholder="Select location" />
            </SelectTrigger>
            <SelectContent>
              {availableLocations.length === 0 ? (
                <SelectItem value="" disabled>No locations available</SelectItem>
              ) : (
                availableLocations.map((location) => (
                  <SelectItem key={location} value={location}>
                    {location}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          {errors.location && <p className="text-red-500 text-sm">{errors.location}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="additionalInfo">Additional Location Info</Label>
          <Textarea
            id="additionalInfo"
            name="additionalInfo"
            value={formData.additionalInfo}
            onChange={handleInputChange}
            placeholder="Landmarks, building name, etc."
            aria-label="Additional location information"
            className={theme === "dark" ? "bg-gray-900 border-gray-700 text-white" : ""}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phoneNumber">Phone Number</Label>
          <Input
            id="phoneNumber"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleInputChange}
            placeholder="+233 XX XXX XXXX"
            aria-label="Phone number"
            className={theme === "dark" ? "bg-gray-900 border-gray-700 text-white" : ""}
          />
          {errors.phoneNumber && <p className="text-red-500 text-sm">{errors.phoneNumber}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="deliveryTime">Delivery Time</Label>
          <Input
            id="deliveryTime"
            name="deliveryTime"
            type="datetime-local"
            value={formData.deliveryTime}
            onChange={handleInputChange}
            aria-label="Delivery time"
            className={theme === "dark" ? "bg-gray-900 border-gray-700 text-white" : ""}
          />
          {errors.deliveryTime && <p className="text-red-500 text-sm">{errors.deliveryTime}</p>}
        </div>

        {selectedFood && selectedFood.image_url && (
          <div className={`${theme === "dark" ? "p-4 rounded-lg border border-gray-600" : "p-4 rounded-lg border"} cursor-pointer`} onClick={openGallery}>
            <h3 className="text-md font-medium mb-2">Selected Food</h3>
            <div className="flex justify-center mb-2">
              <img 
                src={selectedFood.image_url} 
                alt={selectedFood.name} 
                className="h-32 w-auto object-cover rounded-md hover:opacity-90 transition-opacity" 
              />
            </div>
            <p className="text-center font-medium">{selectedFood.name}</p>
            <p className="text-center text-sm text-muted-foreground">(Click to view larger image)</p>
          </div>
        )}

        {selectedFood && (
          <OrderSummary 
            food={selectedFood} 
            quantity={formData.quantity} 
            drink={formData.drink} 
          />
        )}

        <Button 
          type="submit" 
          disabled={loading} 
          className="w-full bg-food-primary hover:bg-food-primary/90"
        >
          {loading ? 'Processing...' : 'Place Order'}
        </Button>
      </form>

      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent className={theme === "dark" ? "sm:max-w-md bg-gray-800 text-white" : "sm:max-w-md"}>
          <DialogHeader>
            <DialogTitle className="text-center">Order Confirmed!</DialogTitle>
            <DialogDescription className="text-center">
              Your order has been successfully placed.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="flex flex-col items-center justify-center">
              <p className="font-bold text-xl text-food-primary">Order ID: {orderId}</p>
              <p>Save this ID to track your order status.</p>
            </div>
            
            {selectedFood && (
              <div className={theme === "dark" ? "border rounded-lg p-4 bg-gray-700 border-gray-600" : "border rounded-lg p-4 bg-gray-50"}>
                <h3 className="font-semibold mb-2">Order Details:</h3>
                <p><span className="font-medium">Food:</span> {selectedFood.name}</p>
                <p><span className="font-medium">Quantity:</span> {formData.quantity}</p>
                {formData.drink && <p><span className="font-medium">Drink:</span> {formData.drink}</p>}
                <p><span className="font-medium">Total Price:</span> GHS {selectedFood.price * formData.quantity}</p>
                <p><span className="font-medium">Payment:</span> {formData.paymentMode}</p>
                <p><span className="font-medium">Delivery Location:</span> {formData.location}</p>
                <p><span className="font-medium">Delivery Time:</span> {new Date(formData.deliveryTime).toLocaleString()}</p>
                <p><span className="font-medium">Status:</span> <span className="text-amber-500 font-medium">Pending</span></p>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button onClick={handleCloseConfirmation} className="w-full">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ImageGallery 
        images={galleryImages} 
        isOpen={galleryOpen} 
        onClose={() => setGalleryOpen(false)} 
      />
    </div>
  );
};

export default BookingForm;