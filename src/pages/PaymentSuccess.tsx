
import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Loader2, MessageCircle } from 'lucide-react';
import { showSuccessAlert, showErrorAlert } from '@/lib/alerts';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isVerifying, setIsVerifying] = useState(true);
  const [isSendingSMS, setIsSendingSMS] = useState(false);
  const [orderDetails, setOrderDetails] = useState<any>(null);

  const reference = searchParams.get('reference');
  const orderId = searchParams.get('orderId');

  useEffect(() => {
    const verifyPayment = async () => {
      if (!reference) {
        showErrorAlert('Error', 'Payment reference not found');
        navigate('/');
        return;
      }

      try {
        setIsVerifying(true);
        
        // Verify payment and create order
        const response = await fetch('/api/payments/verify-payment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ reference, orderId }),
        });

        if (!response.ok) {
          throw new Error('Payment verification failed');
        }

        const data = await response.json();
        setOrderDetails(data);
        setIsVerifying(false);
        
        // Show SMS sending state
        setIsSendingSMS(true);
        
        // Simulate SMS sending delay (in real scenario, this would be handled by backend)
        setTimeout(() => {
          setIsSendingSMS(false);
          showSuccessAlert('Payment Successful', 'Your order has been placed successfully! SMS notification sent.');
        }, 2000);
        
      } catch (error) {
        console.error('Payment verification error:', error);
        showErrorAlert('Verification Failed', 'Unable to verify payment. Please contact support.');
        navigate('/payment-failure');
      }
    };

    verifyPayment();
  }, [reference, orderId, navigate]);

  if (isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <Loader2 className="h-12 w-12 animate-spin text-green-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Verifying Payment</h2>
            <p className="text-gray-600 dark:text-gray-300">Please wait while we verify your payment...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isSendingSMS) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <div className="mb-4">
              <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-2" />
              <MessageCircle className="h-8 w-8 animate-pulse text-blue-600 mx-auto" />
            </div>
            <h2 className="text-xl font-semibold mb-2 text-green-600">Payment Verified!</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-2">Sending SMS notification...</p>
            <div className="flex items-center justify-center space-x-2">
              <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
              <span className="text-sm text-blue-600">Please wait...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <CheckCircle className="h-16 w-16 text-green-600" />
          </div>
          <CardTitle className="text-2xl text-green-600">Payment Successful!</CardTitle>
          <CardDescription>
            Your order has been placed successfully and payment has been confirmed.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {orderDetails && (
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border dark:border-gray-700">
              <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">Order Details:</h3>
              <div className="space-y-1 text-sm">
                <p className="text-gray-700 dark:text-gray-300">
                  <span className="font-medium">Order ID:</span> {orderDetails.order_id}
                </p>
                <p className="text-gray-700 dark:text-gray-300">
                  <span className="font-medium">Amount:</span> GHS {orderDetails.totalPrice}
                </p>
                <p className="text-gray-700 dark:text-gray-300">
                  <span className="font-medium">Status:</span> 
                  <span className="text-green-600 ml-1">Confirmed</span>
                </p>
              </div>
            </div>
          )}

          <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-200 dark:border-green-800">
            <div className="flex items-center space-x-2">
              <MessageCircle className="h-4 w-4 text-green-600" />
              <p className="text-green-800 dark:text-green-200 text-sm">
                <strong>SMS Notification Sent!</strong>
              </p>
            </div>
            <p className="text-green-700 dark:text-green-300 text-xs mt-1">
              You'll receive updates about your order via SMS.
            </p>
          </div>
          
          <div className="space-y-2">
            <Button 
              onClick={() => navigate('/')} 
              className="w-full bg-food-primary hover:bg-food-primary/90"
            >
              Place Another Order
            </Button>
            <Button 
              onClick={() => navigate(`/track-order/${orderDetails?.order_id}`)} 
              variant="outline" 
              className="w-full"
            >
              Track Order
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentSuccess;
