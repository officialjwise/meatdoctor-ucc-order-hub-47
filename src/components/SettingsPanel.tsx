import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import Sweetalert2 from 'sweetalert2';
import { SiteSettings } from '@/lib/types';

const BACKEND_URL = 'http://localhost:4000';

const SettingsPanel = () => {
  const [siteSettings, setSiteSettings] = useState<SiteSettings>({
    site_name: 'MeatDoctor UCC',
    site_description: 'Your favorite food delivery service',
    contact_email: 'contact@meatdoctorucc.com',
    contact_phone: '+233 20 000 0000',
    contact_address: 'Cape Coast, Ghana',
    background_image_url: 'https://images.unsplash.com/photo-1561758033-d89a9ad46330?ixlib=rb-1.2.1&auto=format&fit=crop&w=1770&q=80',
    dark_mode_enabled: true,
    notifications_enabled: true,
    footer_text: '© 2025 MeatDoctor UCC. All rights reserved.',
    email_settings: null,
    sms_settings: null,
  });
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [ReactQuill, setReactQuill] = useState<any>(null);
  
  useEffect(() => {
    import('react-quill').then((module) => {
      setReactQuill(() => module.default);
      import('react-quill/dist/quill.snow.css');
    });
    
    const fetchSettings = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/settings`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
          },
        });

        if (!response.ok) {
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Failed to fetch settings (Status: ${response.status})`);
          } else {
            throw new Error(`Failed to fetch settings (Status: ${response.status}) - Unexpected response format`);
          }
        }

        const settings: SiteSettings = await response.json();
        console.log('Fetched settings:', settings);
        setSiteSettings({
          site_name: settings.site_name || 'MeatDoctor UCC',
          site_description: settings.site_description || 'Your favorite food delivery service',
          contact_email: settings.contact_email || 'contact@meatdoctorucc.com',
          contact_phone: settings.contact_phone || '+233 20 000 0000',
          contact_address: settings.contact_address || 'Cape Coast, Ghana',
          background_image_url: settings.background_image_url || 'https://images.unsplash.com/photo-1561758033-d89a9ad46330?ixlib=rb-1.2.1&auto=format&fit=crop&w=1770&q=80',
          dark_mode_enabled: settings.dark_mode_enabled ?? true,
          notifications_enabled: settings.notifications_enabled ?? true,
          footer_text: settings.footer_text || '© 2025 MeatDoctor UCC. All rights reserved.',
          email_settings: settings.email_settings || null,
          sms_settings: settings.sms_settings || null,
        });
        if (settings.background_image_url) {
          setImagePreview(settings.background_image_url);
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
        Sweetalert2.fire('Error', error.message || 'Failed to load settings.', 'error');
      }
    };

    fetchSettings();
  }, []);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSiteSettings(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSwitchChange = (name: string, checked: boolean) => {
    setSiteSettings(prev => ({ ...prev, [name]: checked }));
  };
  
  const handleRichTextChange = (name: string, value: string) => {
    setSiteSettings(prev => ({ ...prev, [name]: value }));
  };
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // First, update the settings (excluding the background image)
      const settingsPayload = {
        site_name: siteSettings.site_name,
        site_description: siteSettings.site_description,
        contact_email: siteSettings.contact_email,
        contact_phone: siteSettings.contact_phone,
        contact_address: siteSettings.contact_address,
        dark_mode_enabled: siteSettings.dark_mode_enabled,
        notifications_enabled: siteSettings.notifications_enabled,
        footer_text: siteSettings.footer_text,
        email_settings: siteSettings.email_settings,
        sms_settings: siteSettings.sms_settings,
      };

      console.log('Sending settings payload:', settingsPayload);

      const settingsResponse = await fetch(`${BACKEND_URL}/api/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
        },
        body: JSON.stringify(settingsPayload),
      });

      if (!settingsResponse.ok) {
        const contentType = settingsResponse.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const errorData = await settingsResponse.json();
          throw new Error(errorData.message || `Failed to update settings (Status: ${settingsResponse.status})`);
        } else {
          throw new Error(`Failed to update settings (Status: ${settingsResponse.status}) - Unexpected response format`);
        }
      }

      const settingsResult = await settingsResponse.json();
      console.log('Settings update response:', settingsResult);

      // If there's an image file, upload it separately
      if (imageFile) {
        const formData = new FormData();
        formData.append('image', imageFile);

        const uploadResponse = await fetch(`${BACKEND_URL}/api/settings/upload-background`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
          },
          body: formData,
        });

        if (!uploadResponse.ok) {
          const contentType = uploadResponse.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const errorData = await uploadResponse.json();
            throw new Error(errorData.message || `Failed to upload background image (Status: ${uploadResponse.status})`);
          } else {
            throw new Error(`Failed to upload background image (Status: ${uploadResponse.status}) - Unexpected response format`);
          }
        }

        const uploadData = await uploadResponse.json();
        console.log('Background image upload response:', uploadData);
        setSiteSettings(prev => ({ ...prev, background_image_url: uploadData.backgroundImageUrl }));
        setImagePreview(uploadData.backgroundImageUrl);
        setImageFile(null);
      }

      Sweetalert2.fire({
        title: 'Success',
        text: 'Settings updated successfully',
        icon: 'success',
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
      });

      // Refresh settings to ensure UI reflects the latest data
      const fetchResponse = await fetch(`${BACKEND_URL}/api/settings`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
        },
      });

      if (fetchResponse.ok) {
        const updatedSettings: SiteSettings = await fetchResponse.json();
        console.log('Refreshed settings:', updatedSettings);
        setSiteSettings({
          site_name: updatedSettings.site_name || 'MeatDoctor UCC',
          site_description: updatedSettings.site_description || 'Your favorite food delivery service',
          contact_email: updatedSettings.contact_email || 'contact@meatdoctorucc.com',
          contact_phone: updatedSettings.contact_phone || '+233 20 000 0000',
          contact_address: updatedSettings.contact_address || 'Cape Coast, Ghana',
          background_image_url: updatedSettings.background_image_url || 'https://images.unsplash.com/photo-1561758033-d89a9ad46330?ixlib=rb-1.2.1&auto=format&fit=crop&w=1770&q=80',
          dark_mode_enabled: updatedSettings.dark_mode_enabled ?? true,
          notifications_enabled: updatedSettings.notifications_enabled ?? true,
          footer_text: updatedSettings.footer_text || '© 2025 MeatDoctor UCC. All rights reserved.',
          email_settings: updatedSettings.email_settings || null,
          sms_settings: updatedSettings.sms_settings || null,
        });
        if (updatedSettings.background_image_url) {
          setImagePreview(updatedSettings.background_image_url);
        }
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      Sweetalert2.fire('Error', error.message || 'Failed to save settings.', 'error');
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Tabs defaultValue="general">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="contact">Contact Info</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>
                Configure the basic information about your restaurant.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="site_name">Restaurant Name</Label>
                <Input
                  id="site_name"
                  name="site_name"
                  value={siteSettings.site_name}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="site_description">Restaurant Description</Label>
                <div className="rich-text-container">
                  {ReactQuill ? (
                    <ReactQuill
                      theme="snow"
                      value={siteSettings.site_description}
                      onChange={(value) => handleRichTextChange('site_description', value)}
                      style={{ height: '200px', marginBottom: '50px' }}
                      modules={{
                        toolbar: [
                          [{ 'header': [1, 2, 3, false] }],
                          ['bold', 'italic', 'underline', 'strike'],
                          [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                          ['link', 'clean']
                        ]
                      }}
                    />
                  ) : (
                    <div className="p-4 border rounded bg-gray-50">Loading editor...</div>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="footer_text">Footer Text</Label>
                <div className="rich-text-container">
                  {ReactQuill ? (
                    <ReactQuill
                      theme="snow"
                      value={siteSettings.footer_text}
                      onChange={(value) => handleRichTextChange('footer_text', value)}
                      style={{ height: '150px', marginBottom: '50px' }}
                      modules={{
                        toolbar: [
                          [{ 'header': [1, 2, 3, false] }],
                          ['bold', 'italic', 'underline'],
                          ['link', 'clean']
                        ]
                      }}
                    />
                  ) : (
                    <div className="p-4 border rounded bg-gray-50">Loading editor...</div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="appearance" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Appearance Settings</CardTitle>
              <CardDescription>
                Customize the look and feel of your website.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="background_image_url">Background Image</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Input
                      id="background_image_url"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      Upload an image for your website background.
                    under 5MB.
                    </p>
                  </div>
                  
                  {imagePreview && (
                    <div>
                      <p className="mb-2 font-medium">Preview:</p>
                      <img 
                        src={imagePreview} 
                        alt="Background preview" 
                        className="max-h-40 object-cover rounded border"
                      />
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-2 pt-2">
                <Switch
                  id="dark_mode_enabled"
                  checked={siteSettings.dark_mode_enabled}
                  onCheckedChange={(checked) => handleSwitchChange('dark_mode_enabled', checked)}
                />
                <Label htmlFor="dark_mode_enabled">Enable Dark Mode by Default</Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="contact" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
              <CardDescription>
                Update your contact details for customers.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="contact_email">Email Address</Label>
                <Input
                  id="contact_email"
                  name="contact_email"
                  type="email"
                  value={siteSettings.contact_email}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="contact_phone">Phone Number</Label>
                <Input
                  id="contact_phone"
                  name="contact_phone"
                  value={siteSettings.contact_phone}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="contact_address">Address</Label>
                <Input
                  id="contact_address"
                  name="contact_address"
                  value={siteSettings.contact_address}
                  onChange={handleInputChange}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>
                Configure how you want to be notified about new orders.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="notifications_enabled"
                  checked={siteSettings.notifications_enabled}
                  onCheckedChange={(checked) => handleSwitchChange('notifications_enabled', checked)}
                />
                <Label htmlFor="notifications_enabled">Enable Order Notifications</Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <div className="flex justify-end">
        <Button type="submit" className="bg-food-primary hover:bg-food-primary/90">
          Save Settings
        </Button>
      </div>
    </form>
  );
};

export default SettingsPanel;