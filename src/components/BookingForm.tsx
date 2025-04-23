
import React, { useState, useEffect } from 'react';
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
  foodMenu, 
  drinkOptions, 
  locationOptions, 
  saveBooking, 
  generateOrderId,
  Booking,
  Food
} from '@/lib/storage';
import { 
  validateBookingForm, 
  BookingFormData, 
  ValidationResult, 
  formatGhanaPhone 
} from '@/lib/validation';
import OrderSummary from './OrderSummary';

const BookingForm = () => {
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
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Set food price when food selection changes
  useEffect(() => {
    if (formData.foodId) {
      const food = foodMenu.find(item => item.id === formData.foodId);
      if (food) {
        setFormData(prev => ({ ...prev, price: food.price }));
        setSelectedFood(food);
      }
    }
  }, [formData.foodId]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when field is changed
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  const handleSelectChange = (name: string, value: string | number) => {
    // Convert to number for numeric fields
    const processedValue = ['foodId', 'price', 'quantity'].includes(name) ? Number(value) : value;
    
    setFormData(prev => ({ ...prev, [name]: processedValue }));
    
    // Clear error when field is changed
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Ensure quantity is between 1 and 10
    let value = parseInt(e.target.value);
    if (isNaN(value)) value = 1;
    if (value < 1) value = 1;
    if (value > 10) value = 10;
    
    setFormData(prev => ({ ...prev, quantity: value }));
    
    // Clear error when field is changed
    if (errors.quantity) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.quantity;
        return newErrors;
      });
    }
  };
  
  const handleDrinkChange = (drink: string) => {
    // Toggle the drink selection
    setFormData(prev => ({
      ...prev,
      drink: prev.drink === drink ? null : drink
    }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const validation: ValidationResult = validateBookingForm(formData);
    
    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }
    
    setLoading(true);
    
    // Simulate API call with a delay
    setTimeout(() => {
      try {
        // Generate order ID
        const newOrderId = generateOrderId();
        setOrderId(newOrderId);
        
        // Create booking object
        const booking: Booking = {
          id: newOrderId,
          food: selectedFood!,
          quantity: formData.quantity,
          drink: formData.drink,
          paymentMode: formData.paymentMode,
          location: formData.location,
          additionalInfo: formData.additionalInfo,
          phoneNumber: formatGhanaPhone(formData.phoneNumber),
          deliveryTime: formData.deliveryTime,
          status: 'Pending',
          createdAt: new Date().toISOString()
        };
        
        // Save booking to localStorage
        saveBooking(booking);
        
        // Show confirmation dialog
        setShowConfirmation(true);
        
        // Simulate SMS/Email notification
        console.log('SMS Notification:', { 
          to: booking.phoneNumber, 
          message: `Order #${newOrderId} confirmed. Your MeatDoctorUcc order has been placed and will be delivered at ${booking.deliveryTime}. Thank you!` 
        });
        
        setLoading(false);
      } catch (error) {
        console.error('Error saving booking:', error);
        toast.error('An error occurred while processing your order. Please try again.');
        setLoading(false);
      }
    }, 1000);
  };
  
  const handleCloseConfirmation = () => {
    setShowConfirmation(false);
    
    // Reset form
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
  
  return (
    <div className="w-full max-w-3xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6 bg-white/90 backdrop-blur-sm p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-food-dark">Order Form</h2>
        
        {/* Food Selection */}
        <div className="space-y-2">
          <Label htmlFor="foodId">Select Food</Label>
          <Select
            value={formData.foodId.toString()}
            onValueChange={(value) => handleSelectChange('foodId', parseInt(value))}
          >
            <SelectTrigger id="foodId" aria-label="Select food">
              <SelectValue placeholder="Select food" />
            </SelectTrigger>
            <SelectContent>
              {foodMenu.map((food) => (
                <SelectItem key={food.id} value={food.id.toString()}>
                  {food.name} (GHS {food.price})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.foodId && <p className="text-red-500 text-sm">{errors.foodId}</p>}
        </div>
        
        {/* Price (Auto-populated) */}
        <div className="space-y-2">
          <Label htmlFor="price">Price (GHS)</Label>
          <Input
            id="price"
            name="price"
            type="number"
            value={formData.price}
            onChange={handleInputChange}
            readOnly
            className="bg-gray-100"
            aria-label="Food price"
          />
          {errors.price && <p className="text-red-500 text-sm">{errors.price}</p>}
        </div>
        
        {/* Quantity */}
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
          />
          {errors.quantity && <p className="text-red-500 text-sm">{errors.quantity}</p>}
        </div>
        
        {/* Add a Drink */}
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
        
        {/* Payment Mode */}
        <div className="space-y-2">
          <Label>Payment Mode</Label>
          <RadioGroup
            value={formData.paymentMode}
            onValueChange={(value) => handleSelectChange('paymentMode', value as 'Mobile Money' | 'Cash')}
            className="flex flex-col space-y-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Mobile Money" id="mobile-money" />
              <Label htmlFor="mobile-money">Mobile Money</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Cash" id="cash" />
              <Label htmlFor="cash">Cash</Label>
            </div>
          </RadioGroup>
          {errors.paymentMode && <p className="text-red-500 text-sm">{errors.paymentMode}</p>}
        </div>
        
        {/* Select Location */}
        <div className="space-y-2">
          <Label htmlFor="location">Select Location</Label>
          <Select
            value={formData.location}
            onValueChange={(value) => handleSelectChange('location', value)}
          >
            <SelectTrigger id="location" aria-label="Select location">
              <SelectValue placeholder="Select location" />
            </SelectTrigger>
            <SelectContent>
              {locationOptions.map((location) => (
                <SelectItem key={location} value={location}>
                  {location}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.location && <p className="text-red-500 text-sm">{errors.location}</p>}
        </div>
        
        {/* Additional Location Info */}
        <div className="space-y-2">
          <Label htmlFor="additionalInfo">Additional Location Info</Label>
          <Textarea
            id="additionalInfo"
            name="additionalInfo"
            value={formData.additionalInfo}
            onChange={handleInputChange}
            placeholder="Landmarks, building name, etc."
            aria-label="Additional location information"
          />
        </div>
        
        {/* Phone Number */}
        <div className="space-y-2">
          <Label htmlFor="phoneNumber">Phone Number</Label>
          <Input
            id="phoneNumber"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleInputChange}
            placeholder="+233 XX XXX XXXX"
            aria-label="Phone number"
          />
          {errors.phoneNumber && <p className="text-red-500 text-sm">{errors.phoneNumber}</p>}
        </div>
        
        {/* Delivery Time */}
        <div className="space-y-2">
          <Label htmlFor="deliveryTime">Delivery Time</Label>
          <Input
            id="deliveryTime"
            name="deliveryTime"
            type="datetime-local"
            value={formData.deliveryTime}
            onChange={handleInputChange}
            aria-label="Delivery time"
          />
          {errors.deliveryTime && <p className="text-red-500 text-sm">{errors.deliveryTime}</p>}
        </div>
        
        {/* Order Summary */}
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
      
      {/* Confirmation Modal */}
      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent className="sm:max-w-md">
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
              <div className="border rounded-lg p-4 bg-gray-50">
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
    </div>
  );
};

export default BookingForm;
