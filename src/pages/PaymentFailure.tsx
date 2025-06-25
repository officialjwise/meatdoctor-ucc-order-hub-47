
import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { XCircle, RefreshCw, Home } from 'lucide-react';

const PaymentFailure = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const message = searchParams.get('message') || 'Payment was unsuccessful';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <XCircle className="h-16 w-16 text-red-600" />
          </div>
          <CardTitle className="text-2xl text-red-600">Payment Failed</CardTitle>
          <CardDescription>
            {message}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <h3 className="font-semibold text-red-800 mb-2">What happened?</h3>
            <p className="text-red-700 text-sm">
              Your payment could not be processed. This might be due to insufficient funds, 
              network issues, or card restrictions.
            </p>
          </div>
          
          <div className="space-y-2">
            <Button 
              onClick={() => navigate('/')} 
              className="w-full bg-food-primary hover:bg-food-primary/90"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
            <Button 
              onClick={() => navigate('/')} 
              variant="outline" 
              className="w-full"
            >
              <Home className="h-4 w-4 mr-2" />
              Return Home
            </Button>
          </div>
          
          <div className="text-center text-sm text-gray-600">
            <p>Need help? Contact our support team.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentFailure;
