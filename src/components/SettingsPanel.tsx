import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { getSiteSettings, updateSiteSettings, SiteSettings } from '@/lib/storage';
import { showSuccessAlert, showErrorAlert } from '@/lib/alerts';
import Sweetalert2 from 'sweetalert2';

const SettingsPanel = () => {
  const [siteSettings, setSiteSettings] = useState<SiteSettings>({
    siteName: 'MeatDoctor UCC',
    siteDescription: 'Your favorite food delivery service',
    contactEmail: 'contact@meatdoctorucc.com',
    contactPhone: '+233 20 000 0000',
    contactAddress: 'Cape Coast, Ghana',
    bgImageUrl: 'https://images.unsplash.com/photo-1561758033-d89a9ad46330?ixlib=rb-1.2.1&auto=format&fit=crop&w=1770&q=80',
    darkModeEnabled: true,
    notificationsEnabled: true,
    footerText: '© 2023 MeatDoctor UCC. All rights reserved.'
  });
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [ReactQuill, setReactQuill] = useState<any>(null);
  
  useEffect(() => {
    import('react-quill').then((module) => {
      setReactQuill(() => module.default);
      import('react-quill/dist/quill.snow.css');
    });
    
    const settings = getSiteSettings();
    if (settings) {
      setSiteSettings(settings);
      if (settings.bgImageUrl) {
        setImagePreview(settings.bgImageUrl);
      }
    }
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
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (imageFile) {
        const reader = new FileReader();
        reader.onloadend = () => {
          const updatedSettings = {
            ...siteSettings,
            bgImageUrl: reader.result as string
          };
          
          updateSiteSettings(updatedSettings);
          showSuccessAlert('Success!', 'Settings updated successfully.');
        };
        reader.readAsDataURL(imageFile);
      } else {
        updateSiteSettings(siteSettings);
        showSuccessAlert('Success!', 'Settings updated successfully.');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      showErrorAlert('Error!', 'Failed to save settings.');
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
                <Label htmlFor="siteName">Restaurant Name</Label>
                <Input
                  id="siteName"
                  name="siteName"
                  value={siteSettings.siteName}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="siteDescription">Restaurant Description</Label>
                <div className="rich-text-container">
                  {ReactQuill ? (
                    <ReactQuill
                      theme="snow"
                      value={siteSettings.siteDescription}
                      onChange={(value) => handleRichTextChange('siteDescription', value)}
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
                <Label htmlFor="footerText">Footer Text</Label>
                <div className="rich-text-container">
                  {ReactQuill ? (
                    <ReactQuill
                      theme="snow"
                      value={siteSettings.footerText}
                      onChange={(value) => handleRichTextChange('footerText', value)}
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
                <Label htmlFor="bgImage">Background Image</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Input
                      id="bgImage"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      Upload an image for your website background.
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
                  id="darkMode"
                  checked={siteSettings.darkModeEnabled}
                  onCheckedChange={(checked) => handleSwitchChange('darkModeEnabled', checked)}
                />
                <Label htmlFor="darkMode">Enable Dark Mode by Default</Label>
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
                <Label htmlFor="contactEmail">Email Address</Label>
                <Input
                  id="contactEmail"
                  name="contactEmail"
                  type="email"
                  value={siteSettings.contactEmail}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="contactPhone">Phone Number</Label>
                <Input
                  id="contactPhone"
                  name="contactPhone"
                  value={siteSettings.contactPhone}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="contactAddress">Address</Label>
                <Input
                  id="contactAddress"
                  name="contactAddress"
                  value={siteSettings.contactAddress}
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
                  id="notifications"
                  checked={siteSettings.notificationsEnabled}
                  onCheckedChange={(checked) => handleSwitchChange('notificationsEnabled', checked)}
                />
                <Label htmlFor="notifications">Enable Order Notifications</Label>
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
