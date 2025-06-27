import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

const BACKEND_URL = process.env.NODE_ENV === 'production' 
  ? 'https://meatdoctor-ucc-officialjwise-dev.apps.rm3.7wse.p1.openshiftapps.com' // Replace with your actual backend URL
  : 'https://meatdoctor-ucc-officialjwise-dev.apps.rm3.7wse.p1.openshiftapps.com';

const AdminOTP = () => {
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
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
    const otp = otpDigits.join('');
    if (otp.length === 6 && !loading) {
      handleVerifyOTP(otp);
    }
  }, [otpDigits, loading]);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return; // Only allow single digit
    
    const newOtpDigits = [...otpDigits];
    newOtpDigits[index] = value;
    setOtpDigits(newOtpDigits);
    
    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>, index: number) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('Text').trim();
    
    if (pastedData.length === 6 && /^\d+$/.test(pastedData)) {
      const otpArray = pastedData.split('');
      setOtpDigits(otpArray);
      // Focus the last input
      const lastInput = document.getElementById('otp-5');
      lastInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };
  
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
      toast.error(error.message || 'Invalid OTP. Please try again or resend OTP.');
      setOtpDigits(['', '', '', '', '', '']); // Clear OTP on error
      // Focus first input
      const firstInput = document.getElementById('otp-0');
      firstInput?.focus();
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
      toast.error(error.message || 'Failed to resend OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-slate-900/40 to-slate-900"></div>
      
      <Card className="w-full max-w-md shadow-2xl border-0 bg-white/10 backdrop-blur-lg relative z-10">
        <CardHeader className="space-y-1 text-center pb-8">
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Verify OTP
          </CardTitle>
          <CardDescription className="text-gray-300">
            Enter the 6-digit code sent to {email}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <Label htmlFor="otp" className="text-gray-200 font-medium text-center block">OTP Code</Label>
            <div className="flex justify-center gap-2">
              {otpDigits.map((digit, index) => (
                <Input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={(e) => handlePaste(e, index)}
                  disabled={loading}
                  className="w-12 h-12 text-center text-lg font-bold rounded-xl border-gray-600 bg-white/10 text-white placeholder-gray-400 focus:border-purple-400 focus:ring-purple-400 shadow-lg"
                />
              ))}
            </div>
            {loading && (
              <p className="text-center text-sm text-gray-300">
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
            className="text-sm text-purple-400 hover:text-pink-400"
          >
            {canResend ? 'Resend OTP' : `Resend OTP in ${countdown}s`}
          </Button>
          <Button
            variant="ghost"
            onClick={() => navigate('/admin')}
            className="text-sm text-gray-400 hover:text-gray-200"
          >
            Back to Login
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default AdminOTP;
