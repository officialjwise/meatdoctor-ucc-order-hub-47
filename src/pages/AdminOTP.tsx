
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { createAdminSession } from '@/lib/storage';

const AdminOTP = () => {
  const [otp, setOtp] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const navigate = useNavigate();
  
  useEffect(() => {
    // Get the email from localStorage
    const tempEmail = localStorage.getItem('tempAdminEmail');
    
    if (!tempEmail) {
      // No email found, redirect to login
      navigate('/admin');
      return;
    }
    
    setEmail(tempEmail);
    
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
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!otp.trim()) {
      toast.error('Please enter the OTP');
      return;
    }
    
    setLoading(true);
    
    // For demo purposes, accept '123456' as the OTP
    setTimeout(() => {
      if (otp === '123456') {
        // Create admin session
        createAdminSession(email);
        
        toast.success('Login successful');
        navigate('/admin/dashboard');
      } else {
        toast.error('Invalid OTP. For demo purposes, use 123456');
      }
      
      setLoading(false);
    }, 1000);
  };
  
  const handleResendOTP = () => {
    if (!canResend) return;
    
    setLoading(true);
    
    // Simulate OTP resending
    setTimeout(() => {
      console.log('Email Notification:', {
        to: email,
        subject: 'MeatDoctorUcc Admin OTP',
        body: 'Your OTP for MeatDoctorUcc admin access is: 123456'
      });
      
      toast.success('OTP has been resent. For demo purposes, use 123456');
      
      setCountdown(30);
      setCanResend(false);
      setLoading(false);
      
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
    }, 1000);
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
              <p className="text-sm text-gray-500 text-center">
                For demo purposes, use <span className="font-medium">123456</span>
              </p>
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
