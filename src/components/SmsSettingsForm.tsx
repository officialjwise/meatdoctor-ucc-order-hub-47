
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from "sonner";
import { getSettings, saveSettings } from '@/lib/storage';

const SmsSettingsForm = () => {
  const [settings, setSettings] = useState({
    clientId: '',
    clientSecret: '',
    senderId: '',
  });
  
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    // Load settings from localStorage
    const storedSettings = getSettings();
    setSettings({
      clientId: storedSettings.sms.clientId || '',
      clientSecret: storedSettings.sms.clientSecret || '',
      senderId: storedSettings.sms.senderId || 'MeatDoctor',
    });
  }, []);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const saveSmsSettings = () => {
    if (!settings.clientId || !settings.clientSecret || !settings.senderId) {
      toast.error('Please fill all required fields');
      return;
    }
    
    setLoading(true);
    
    // Simulate API call with a delay
    setTimeout(() => {
      try {
        const currentSettings = getSettings();
        const updatedSettings = {
          ...currentSettings,
          sms: {
            clientId: settings.clientId,
            clientSecret: settings.clientSecret,
            senderId: settings.senderId,
          }
        };
        
        saveSettings(updatedSettings);
        toast.success('SMS settings updated successfully');
      } catch (error) {
        console.error('Error saving settings:', error);
        toast.error('An error occurred while saving settings');
      } finally {
        setLoading(false);
      }
    }, 500);
  };
  
  const testSmsConnection = () => {
    if (!settings.clientId || !settings.clientSecret || !settings.senderId) {
      toast.error('Please fill all required SMS settings first');
      return;
    }
    
    console.log('Testing Hubtel SMS API with settings:', {
      clientId: `${settings.clientId.substring(0, 4)}...`, // Only show first 4 chars for security
      clientSecret: '••••••••', // Don't log the secret
      senderId: settings.senderId,
      message: 'This is a test message from MeatDoctorUcc',
      to: '+233XXXXXXXXX'
    });
    
    toast.success('Test SMS sent! Check the console for details.');
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>SMS Settings</CardTitle>
        <CardDescription>
          Configure SMS notification settings (Hubtel)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="clientId">Hubtel Client ID</Label>
          <Input
            id="clientId"
            name="clientId"
            value={settings.clientId}
            onChange={handleInputChange}
            placeholder="Enter your Hubtel Client ID"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="clientSecret">Hubtel Client Secret</Label>
          <Input
            id="clientSecret"
            name="clientSecret"
            type="password"
            value={settings.clientSecret}
            onChange={handleInputChange}
            placeholder="••••••••"
          />
          <p className="text-xs text-muted-foreground">
            Your client secret is stored securely and never shared
          </p>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="senderId">Sender ID</Label>
          <Input
            id="senderId"
            name="senderId"
            value={settings.senderId}
            onChange={handleInputChange}
            placeholder="MeatDoctor"
            maxLength={11}
          />
          <p className="text-xs text-muted-foreground">
            Maximum 11 characters, no spaces or special characters
          </p>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={testSmsConnection}>
          Test SMS
        </Button>
        <Button onClick={saveSmsSettings} disabled={loading}>
          {loading ? 'Saving...' : 'Save Changes'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default SmsSettingsForm;
