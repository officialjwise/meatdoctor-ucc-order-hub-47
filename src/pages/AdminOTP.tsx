import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

const BACKEND_URL = 'http://localhost:4000';

const AdminOTP = () => {
  const [otp, setOtp] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const navigate = useNavigate();
  
  useEffect(() => {
    // Get the email and password from localStorage
    const tempEmail = localStorage.getItem('tempAdminEmail');
    const tempPassword = localStorage.getItem('tempAdminPassword');
    
    if (!tempEmail || !tempPassword) {
      // No email or password found, redirect to login
      navigate('/admin');
      return;
    }
    
    setEmail(tempEmail);
    setPassword(tempPassword);
    
    // Set up countdown timer
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [navigate]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!otp.trim()) {
      toast.error('Please enter the OTP');
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, otp }),
      });

      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          if (response.status === 401 && errorData.message === 'Invalid password') {
            throw new Error('Invalid password');
          }
          throw new Error(errorData.message || `Invalid OTP (Status: ${response.status})`);
        } else {
          throw new Error(`Invalid OTP (Status: ${response.status}) - Unexpected response format`);
        }
      }

      const data = await response.json();
      localStorage.setItem('adminToken', data.token);
      localStorage.setItem('tokenExpiry', (new Date().getTime() + 60 * 60 * 1000).toString()); // 1 hour expiry
      localStorage.removeItem('tempAdminEmail');
      localStorage.removeItem('tempAdminPassword');
      toast.success(data.message);
      navigate('/admin/dashboard');
    } catch (error) {
      console.error('Error verifying OTP:', error);
      toast.error(error.message || 'Invalid OTP. Please try again or resend OTP.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleResendOTP = async () => {
    if (!canResend) return;
    
    setLoading(true);
    
    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          if (response.status === 401 && errorData.message === 'Invalid password') {
            throw new Error('Invalid password');
          }
          throw new Error(errorData.message || `Failed to resend OTP (Status: ${response.status})`);
        } else {
          throw new Error(`Failed to resend OTP (Status: ${response.status}) - Unexpected response format`);
        }
      }

      const data = await response.json();
      toast.success(data.message);
      setCountdown(30);
      setCanResend(false);
      
      // Set up countdown timer again
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => clearInterval(timer);
    } catch (error) {
      console.error('Error resending OTP:', error);
      toast.error(error.message || 'Failed to resend OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">Verify OTP</CardTitle>
          <CardDescription>
            Enter the 6-digit code sent to {email}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="otp">OTP Code</Label>
              <Input
                id="otp"
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength={6}
                required
                inputMode="numeric"
                aria-label="OTP input"
              />
            </div>
            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading}
              aria-label="Verify OTP"
            >
              {loading ? 'Verifying...' : 'Verify'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2 text-center">
          <Button
            variant="link"
            disabled={!canResend || loading}
            onClick={handleResendOTP}
            className="text-sm"
          >
            {canResend ? 'Resend OTP' : `Resend OTP in ${countdown}s`}
          </Button>
          <Button
            variant="ghost"
            onClick={() => navigate('/admin')}
            className="text-sm"
          >
            Back to Login
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default AdminOTP;