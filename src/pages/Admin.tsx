import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

const BACKEND_URL = 'https://meatdoctor-ucc-officialjwise-dev.apps.rm3.7wse.p1.openshiftapps.com';

const Admin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  useEffect(() => {
    // Redirect to dashboard if already authenticated
    const token = localStorage.getItem('adminToken');
    if (token) {
      navigate('/admin/dashboard');
    }
  }, [navigate]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast.error('Please enter your email address');
      return;
    }

    if (!password.trim()) {
      toast.error('Please enter your password');
      return;
    }
    
    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }
    
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
          throw new Error(errorData.message || `Failed to send OTP (Status: ${response.status})`);
        } else {
          throw new Error(`Failed to send OTP (Status: ${response.status}) - Unexpected response format`);
        }
      }

      const data = await response.json();
      toast.success(data.message);
      localStorage.setItem('tempAdminEmail', email);
      localStorage.setItem('tempAdminPassword', password);
      navigate('/admin/otp');
    } catch (error) {
      toast.error(error.message || 'Failed to send OTP. Please try again.');
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
            Admin Login
          </CardTitle>
          <CardDescription className="text-gray-300">
            Enter your email and password to receive an OTP
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="email" className="text-gray-200 font-medium">Email</Label>
              <Input
                id="email"
                placeholder="admin@meatdoctorucc.com"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12 px-4 rounded-xl border-gray-600 bg-white/10 text-white placeholder-gray-400 focus:border-purple-400 focus:ring-purple-400 shadow-lg"
              />
            </div>
            <div className="space-y-3">
              <Label htmlFor="password" className="text-gray-200 font-medium">Password</Label>
              <Input
                id="password"
                placeholder="Enter your password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-12 px-4 rounded-xl border-gray-600 bg-white/10 text-white placeholder-gray-400 focus:border-purple-400 focus:ring-purple-400 shadow-lg"
              />
            </div>
            <Button 
              type="submit" 
              className="w-full h-12 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200 border-0" 
              disabled={loading}
              aria-label="Send OTP"
            >
              {loading ? 'Sending OTP...' : 'Send OTP'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="text-center text-sm text-gray-400 pt-6">
          <p className="w-full">
            Back to <a href="/" className="text-purple-400 hover:text-pink-400 hover:underline transition-colors">Booking Page</a>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Admin;
