import React, { useState, useEffect } from 'react';
import BookingForm from '@/components/BookingForm';
import { getSettings, getBookingById } from '@/lib/storage';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { toast } from "sonner";
import { Search } from 'lucide-react';
import { useTheme } from '@/hooks/use-theme';
const Index = () => {
  const {
    theme
  } = useTheme();
  const [backgroundImage, setBackgroundImage] = useState<string>('');
  const [orderId, setOrderId] = useState<string>('');
  const [showOrderStatus, setShowOrderStatus] = useState(false);
  const [orderDetails, setOrderDetails] = useState<any | null>(null);
  useEffect(() => {
    // Get background image from settings
    const settings = getSettings();
    setBackgroundImage(settings.backgroundImage);
  }, []);
  const handleOrderSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId.trim()) {
      toast.error('Please enter an Order ID');
      return;
    }
    const booking = getBookingById(orderId.trim());
    if (booking) {
      setOrderDetails(booking);
      setShowOrderStatus(true);
    } else {
      toast.error('Order not found. Please check the Order ID and try again.');
      setShowOrderStatus(false);
    }
  };
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending':
        return theme === 'dark' ? 'text-amber-400' : 'text-amber-500';
      case 'Confirmed':
        return theme === 'dark' ? 'text-blue-400' : 'text-blue-500';
      case 'Delivered':
        return theme === 'dark' ? 'text-green-400' : 'text-green-500';
      case 'Cancelled':
        return theme === 'dark' ? 'text-red-400' : 'text-red-500';
      default:
        return theme === 'dark' ? 'text-gray-400' : 'text-gray-500';
    }
  };

  // Define classes based on theme
  const trackingPanelClass = theme === "dark" ? "bg-gray-800/95 backdrop-blur-sm p-6 rounded-lg shadow-lg border border-gray-700 text-white" : "bg-white/90 backdrop-blur-sm p-6 rounded-lg shadow-lg dark:bg-gray-800/90 dark:text-white";
  const contactPanelClass = theme === "dark" ? "bg-gray-800/95 backdrop-blur-sm p-6 rounded-lg shadow-lg border border-gray-700 text-white" : "bg-white/90 backdrop-blur-sm p-6 rounded-lg shadow-lg dark:bg-gray-800/90 dark:text-white";
  const cardClass = theme === "dark" ? "mt-4 bg-gray-700 border-gray-600" : "mt-4";
  const inputClass = theme === "dark" ? "bg-gray-900 border-gray-700 text-white" : "";
  return <div className="min-h-screen p-4 md:p-8 booking-bg flex flex-col items-center" style={{
    backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url(${backgroundImage})`
  }}>
      <div className="w-full max-w-6xl mx-auto">
        <header className="mb-8 text-center relative">
          <div className="absolute right-0 top-0">
            <ThemeToggle />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 animate-fade-in">MeatDoctor UCC</h1>
          <p className="text-white/80 text-lg md:text-xl">Delicious meals, delivered to your doorstep</p>
        </header>
        
        <div className="flex flex-col md:flex-row gap-6">
          {/* Booking Form */}
          <div className="w-full md:w-2/3">
            <BookingForm />
          </div>
          
          {/* Order Tracking */}
          <div className="w-full md:w-1/3 space-y-6">
            <div className={trackingPanelClass}>
              <h2 className="text-2xl font-bold mb-4">Track Your Order</h2>
              <form onSubmit={handleOrderSearch} className="space-y-4">
                <div className="flex space-x-2">
                  <Input placeholder="Enter your Order ID" value={orderId} onChange={e => setOrderId(e.target.value)} className={`flex-1 ${inputClass}`} />
                  <Button type="submit" variant={theme === "dark" ? "outline" : "default"}>
                    <Search className="h-4 w-4 mr-2" />
                    Track
                  </Button>
                </div>
              </form>
              
              {showOrderStatus && orderDetails && <Card className={cardClass}>
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-2">Order #{orderDetails.id}</h3>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium">Food:</span> {orderDetails.food.name}</p>
                      <p><span className="font-medium">Quantity:</span> {orderDetails.quantity}</p>
                      <p><span className="font-medium">Location:</span> {orderDetails.location}</p>
                      <p>
                        <span className="font-medium">Status:</span> 
                        <span className={`ml-1 font-medium ${getStatusColor(orderDetails.status)}`}>
                          {orderDetails.status}
                        </span>
                      </p>
                      <p><span className="font-medium">Delivery Time:</span> {new Date(orderDetails.deliveryTime).toLocaleString()}</p>
                    </div>
                  </CardContent>
                </Card>}
            </div>
            
            <div className={contactPanelClass}>
              <h2 className="text-xl font-bold mb-2">Contact Us</h2>
              <p className={theme === "dark" ? "text-gray-300" : "text-gray-700 dark:text-gray-300"}>Need help with your order?</p>
              <p className={theme === "dark" ? "text-gray-300" : "text-gray-700 dark:text-gray-300"}>
                Call us at: <span className="font-medium">+233 20 123 4567</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>;
};
export default Index;