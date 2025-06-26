
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';

const BACKEND_URL = 'http://localhost:3000';

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

  // Auto-verify when OTP is complete (6 digits)
  useEffect(() => {
    if (otp.length === 6) {
      handleVerifyOTP(otp);
    }
  }, [otp]);
  
  const handleVerifyOTP = async (otpValue: string) => {
    if (loading) return;
    
    setLoading(true);
    
    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, otp: otpValue }),
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
      setOtp(''); // Clear OTP on error
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-cyan-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-0 bg-white/70 backdrop-blur-sm">
        <CardHeader className="space-y-1 text-center pb-8">
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Verify OTP
          </CardTitle>
          <CardDescription className="text-gray-600">
            Enter the 6-digit code sent to {email}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <Label htmlFor="otp" className="text-gray-700 font-medium text-center block">OTP Code</Label>
            <div className="flex justify-center">
              <InputOTP
                maxLength={6}
                value={otp}
                onChange={(value) => setOtp(value)}
                disabled={loading}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>
            {loading && (
              <p className="text-center text-sm text-gray-600">
                Verifying OTP...
              </p>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 text-center pt-6">
          <Button
            variant="link"
            disabled={!canResend || loading}
            onClick={handleResendOTP}
            className="text-sm text-blue-600 hover:text-purple-600"
          >
            {canResend ? 'Resend OTP' : `Resend OTP in ${countdown}s`}
          </Button>
          <Button
            variant="ghost"
            onClick={() => navigate('/admin')}
            className="text-sm text-gray-600 hover:text-gray-800"
          >
            Back to Login
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default AdminOTP;
