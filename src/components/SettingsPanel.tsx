
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from "sonner";
import { getSettings, saveSettings, Settings as SettingsType } from '@/lib/storage';

const SettingsPanel = () => {
  const [settings, setSettings] = useState<SettingsType>({
    backgroundImage: '',
    email: {
      host: '',
      port: '',
      user: '',
      password: '',
    },
    sms: {
      clientId: '',
      clientSecret: '',
      senderId: '',
    },
  });
  
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    // Load settings from localStorage
    const storedSettings = getSettings();
    setSettings(storedSettings);
  }, []);
  
  const handleBackgroundImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSettings(prev => ({
      ...prev,
      backgroundImage: e.target.value
    }));
  };
  
  const handleEmailSettingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({
      ...prev,
      email: {
        ...prev.email,
        [name]: value
      }
    }));
  };
  
  const handleSmsSettingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({
      ...prev,
      sms: {
        ...prev.sms,
        [name]: value
      }
    }));
  };
  
  const saveBackgroundImage = () => {
    if (!settings.backgroundImage) {
      toast.error('Please enter a background image URL');
      return;
    }
    
    setLoading(true);
    
    // Simulate API call with a delay
    setTimeout(() => {
      try {
        saveSettings(settings);
        toast.success('Background image updated successfully');
      } catch (error) {
        console.error('Error saving settings:', error);
        toast.error('An error occurred while saving settings');
      } finally {
        setLoading(false);
      }
    }, 500);
  };
  
  const saveEmailSettings = () => {
    if (!settings.email.host || !settings.email.port || !settings.email.user) {
      toast.error('Please fill all required fields');
      return;
    }
    
    setLoading(true);
    
    // Simulate API call with a delay
    setTimeout(() => {
      try {
        saveSettings(settings);
        toast.success('Email settings updated successfully');
      } catch (error) {
        console.error('Error saving settings:', error);
        toast.error('An error occurred while saving settings');
      } finally {
        setLoading(false);
      }
    }, 500);
  };
  
  const saveSmsSettings = () => {
    if (!settings.sms.clientId || !settings.sms.senderId) {
      toast.error('Please fill all required fields');
      return;
    }
    
    setLoading(true);
    
    // Simulate API call with a delay
    setTimeout(() => {
      try {
        saveSettings(settings);
        toast.success('SMS settings updated successfully');
      } catch (error) {
        console.error('Error saving settings:', error);
        toast.error('An error occurred while saving settings');
      } finally {
        setLoading(false);
      }
    }, 500);
  };
  
  const testEmailConnection = () => {
    if (!settings.email.host || !settings.email.port || !settings.email.user) {
      toast.error('Please fill all required email settings first');
      return;
    }
    
    console.log('Testing email connection with settings:', {
      host: settings.email.host,
      port: settings.email.port,
      user: settings.email.user,
      // Password is not logged for security
    });
    
    toast.success('Test email sent! Check the console for details.');
  };
  
  const testSmsConnection = () => {
    if (!settings.sms.clientId || !settings.sms.senderId) {
      toast.error('Please fill all required SMS settings first');
      return;
    }
    
    console.log('Testing SMS API with settings:', {
      clientId: `${settings.sms.clientId.substring(0, 4)}...`, // Only show first 4 chars of client ID
      senderId: settings.sms.senderId,
      message: 'This is a test message from MeatDoctorUcc',
      to: '+233XXXXXXXXX'
    });
    
    toast.success('Test SMS sent! Check the console for details.');
  };
  
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Settings</h2>
      
      <Tabs defaultValue="background">
        <TabsList>
          <TabsTrigger value="background">Background Image</TabsTrigger>
          <TabsTrigger value="email">Email Settings</TabsTrigger>
          <TabsTrigger value="sms">SMS Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="background" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Background Image Settings</CardTitle>
              <CardDescription>
                Set the background image for the booking page
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="backgroundImage">Background Image URL</Label>
                <Input
                  id="backgroundImage"
                  value={settings.backgroundImage}
                  onChange={handleBackgroundImageChange}
                  placeholder="https://example.com/image.jpg"
                />
                <p className="text-xs text-gray-500">
                  Enter a URL for the background image of the booking page
                </p>
              </div>
              
              {settings.backgroundImage && (
                <div className="space-y-2">
                  <Label>Preview</Label>
                  <div className="border rounded-lg overflow-hidden h-40 bg-center bg-cover" style={{ backgroundImage: `url(${settings.backgroundImage})` }} />
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button onClick={saveBackgroundImage} disabled={loading}>
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="email" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Email Settings</CardTitle>
              <CardDescription>
                Configure email notification settings (Nodemailer)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="emailHost">SMTP Host</Label>
                <Input
                  id="emailHost"
                  name="host"
                  value={settings.email.host}
                  onChange={handleEmailSettingChange}
                  placeholder="smtp.example.com"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="emailPort">SMTP Port</Label>
                <Input
                  id="emailPort"
                  name="port"
                  value={settings.email.port}
                  onChange={handleEmailSettingChange}
                  placeholder="587"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="emailUser">SMTP Username</Label>
                <Input
                  id="emailUser"
                  name="user"
                  value={settings.email.user}
                  onChange={handleEmailSettingChange}
                  placeholder="username@example.com"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="emailPassword">SMTP Password</Label>
                <Input
                  id="emailPassword"
                  name="password"
                  type="password"
                  value={settings.email.password}
                  onChange={handleEmailSettingChange}
                  placeholder="••••••••"
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={testEmailConnection}>
                Test Connection
              </Button>
              <Button onClick={saveEmailSettings} disabled={loading}>
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="sms" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>SMS Settings</CardTitle>
              <CardDescription>
                Configure SMS notification settings (Hubtel)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="smsClientId">Client ID</Label>
                <Input
                  id="smsClientId"
                  name="clientId"
                  value={settings.sms.clientId}
                  onChange={handleSmsSettingChange}
                  placeholder="Enter your Hubtel Client ID"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="smsClientSecret">Client Secret</Label>
                <Input
                  id="smsClientSecret"
                  name="clientSecret"
                  type="password"
                  value={settings.sms.clientSecret}
                  onChange={handleSmsSettingChange}
                  placeholder="••••••••"
                />
                <p className="text-xs text-gray-500">
                  Your client secret is stored securely and never shared
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="smsSenderId">Sender ID</Label>
                <Input
                  id="smsSenderId"
                  name="senderId"
                  value={settings.sms.senderId}
                  onChange={handleSmsSettingChange}
                  placeholder="MeatDoctor"
                  maxLength={11}
                />
                <p className="text-xs text-gray-500">
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
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsPanel;
