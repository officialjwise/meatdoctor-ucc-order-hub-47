
import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, ArrowLeft, Phone, MapPin, Clock, CreditCard } from 'lucide-react';
import { Booking } from '@/lib/types';
import SmsLoadingModal from '@/components/SmsLoadingModal';

const BACKEND_URL = 'https://meatdoctor-ucc-officialjwise-dev.apps.rm3.7wse.p1.openshiftapps.com';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [smsLoading, setSmsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verifyPayment = async () => {
      const reference = searchParams.get('reference');
      
      if (!reference) {
        setError('Payment reference not found');
        setLoading(false);
        return;
      }

      try {
        console.log('Starting payment verification...');
        
        const response = await fetch(`${BACKEND_URL}/api/payment/verify-paystack`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ reference }),
        });

        if (!response.ok) {
          throw new Error('Payment verification failed');
        }

        const orderData = await response.json();
        console.log('Payment verified, order data received:', orderData);
        setOrder(orderData);
        setLoading(false);
        
        // Show SMS loading modal immediately after order data is set
        console.log('Showing SMS loading modal...');
        setSmsLoading(true);
        
        // Keep SMS loading modal visible for 3 seconds
        setTimeout(() => {
          console.log('Hiding SMS loading modal');
          setSmsLoading(false);
        }, 5000);
        
      } catch (err) {
        console.error('Payment verification error:', err);
        setError('Failed to verify payment. Please contact support.');
        setLoading(false);
        setSmsLoading(false);
      }
    };

    verifyPayment();
  }, [searchParams]);

  // Debug log to check smsLoading state
  useEffect(() => {
    console.log('SMS Loading state changed:', smsLoading);
  }, [smsLoading]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-food-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying payment...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <div className="text-red-500 mb-4">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Payment Error</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => navigate('/')} className="w-full">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      {/* Debug: Show SMS loading state */}
      {smsLoading && (
        <div className="fixed top-4 right-4 bg-blue-500 text-white px-4 py-2 rounded z-50">
          SMS Loading: {smsLoading ? 'TRUE' : 'FALSE'}
        </div>
      )}
      
      <SmsLoadingModal 
        isOpen={smsLoading} 
        message="Sending SMS confirmation..."
      />
      
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <Card className="shadow-lg">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-green-600">
                Payment Successful!
              </CardTitle>
              <p className="text-gray-600 mt-2">
                Your order has been confirmed and is being processed.
              </p>
            </CardHeader>

            <CardContent className="space-y-6">
              {order && (
                <>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-3">Order Details</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Order ID:</span>
                        <span className="font-medium">{order.order_id}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Food Item:</span>
                        <span className="font-medium">{order.foodName}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Quantity:</span>
                        <span className="font-medium">{order.quantity}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Total Amount:</span>
                        <span className="font-medium text-green-600">
                          GHS {order.amountPaid?.toFixed(2) || order.totalPrice?.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Payment Status:</span>
                        <span className="font-medium text-green-600">
                          {order.paymentStatus || 'Completed'}
                        </span>
                      </div>
                      {order.paymentReference && (
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Payment Reference:</span>
                          <span className="font-medium text-xs">{order.paymentReference}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-start space-x-3">
                      <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Delivery Location</p>
                        <p className="text-sm text-gray-600">{order.delivery_location}</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Contact Number</p>
                        <p className="text-sm text-gray-600">{order.phone_number}</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Delivery Time</p>
                        <p className="text-sm text-gray-600">
                          {new Date(order.delivery_time).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <CreditCard className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Payment Method</p>
                        <p className="text-sm text-gray-600">{order.payment_mode}</p>
                      </div>
                    </div>
                  </div>

                  {order.addons && order.addons.length > 0 && (
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-2">Add-ons</h4>
                      <ul className="text-sm text-gray-600">
                        {order.addons.map((addon, index) => (
                          <li key={index}>• {addon}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {order.additional_notes && (
                    <div className="bg-yellow-50 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-2">Additional Notes</h4>
                      <p className="text-sm text-gray-600">{order.additional_notes}</p>
                    </div>
                  )}
                </>
              )}

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-medium text-green-800 mb-2">What's Next?</h4>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• You will receive an SMS confirmation shortly</li>
                  <li>• Our team will prepare your order</li>
                  <li>• You'll be notified when your order is ready for delivery</li>
                  <li>• Track your order status in real-time</li>
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  onClick={() => navigate(`/track-order/${order?.order_id}`)}
                  className="flex-1 bg-food-primary hover:bg-food-primary/90"
                  disabled={!order?.order_id}
                >
                  Track Order
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/')}
                  className="flex-1"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Home
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default PaymentSuccess;
