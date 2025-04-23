
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { 
  getSiteSettings, 
  updateSiteSettings, 
  SiteSettings 
} from '@/lib/storage';
import { showSuccessAlert, showErrorAlert } from '@/lib/alerts';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const SettingsPanel = () => {
  const defaultSettings: SiteSettings = {
    siteName: 'MeatDoctor UCC',
    siteDescription: 'Your favorite food delivery service',
    contactEmail: 'contact@meatdoctorucc.com',
    contactPhone: '+233 XX XXX XXXX',
    contactAddress: 'University of Cape Coast, Ghana',
    bgImageUrl: '',
    darkModeEnabled: true,
    notificationsEnabled: true,
    footerText: '© 2023 MeatDoctor UCC. All rights reserved.'
  };
  
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [activeTab, setActiveTab] = useState('general');
  const [bgImageFile, setBgImageFile] = useState<File | null>(null);
  const [bgImagePreview, setBgImagePreview] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Load settings from localStorage
  useEffect(() => {
    const savedSettings = getSiteSettings();
    if (savedSettings) {
      setSettings(savedSettings);
      
      if (savedSettings.bgImageUrl) {
        setBgImagePreview(savedSettings.bgImageUrl);
      }
    }
  }, []);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSettings((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleToggleChange = (name: string, checked: boolean) => {
    setSettings((prev) => ({ ...prev, [name]: checked }));
  };
  
  const handleRichTextChange = (name: string, value: string) => {
    setSettings((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleSaveSettings = () => {
    try {
      // Upload image if present
      if (bgImageFile) {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            // Save the image as base64
            const imageDataUrl = e.target.result.toString();
            const updatedSettings = {
              ...settings,
              bgImageUrl: imageDataUrl
            };
            
            updateSiteSettings(updatedSettings);
            showSuccessAlert('Success', 'Settings saved successfully');
          }
        };
        reader.readAsDataURL(bgImageFile);
      } else {
        // Save without changing the image
        updateSiteSettings(settings);
        showSuccessAlert('Success', 'Settings saved successfully');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      showErrorAlert('Error', 'Failed to save settings');
    }
  };
  
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    if (file) {
      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        showErrorAlert('File Too Large', 'Image must be less than 2MB');
        return;
      }
      
      // Validate file type
      if (!file.type.match('image.*')) {
        showErrorAlert('Invalid File Type', 'Please upload an image file');
        return;
      }
      
      setBgImageFile(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setBgImagePreview(e.target.result.toString());
        }
      };
      reader.readAsDataURL(file);
    }
  };
  
  const removeImage = () => {
    setBgImageFile(null);
    setBgImagePreview('');
    setSettings((prev) => ({ ...prev, bgImageUrl: '' }));
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const quillModules = {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['link'],
      ['clean']
    ],
  };
  
  const quillFormats = [
    'bold', 'italic', 'underline', 'strike',
    'color', 'background',
    'list', 'bullet',
    'link'
  ];
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">System Settings</h2>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="contact">Contact</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>
                Basic settings for your application
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <label htmlFor="siteName" className="text-sm font-medium">
                  Site Name
                </label>
                <Input
                  id="siteName"
                  name="siteName"
                  value={settings.siteName}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="space-y-1">
                <label htmlFor="siteDescription" className="text-sm font-medium">
                  Site Description
                </label>
                <Textarea
                  id="siteDescription"
                  name="siteDescription"
                  value={settings.siteDescription}
                  onChange={handleInputChange}
                  rows={3}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="notificationsEnabled"
                  checked={settings.notificationsEnabled}
                  onCheckedChange={(checked) => 
                    handleToggleChange('notificationsEnabled', checked)
                  }
                />
                <label 
                  htmlFor="notificationsEnabled" 
                  className="text-sm font-medium cursor-pointer"
                >
                  Enable order notifications
                </label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="appearance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Appearance Settings</CardTitle>
              <CardDescription>
                Customize how your application looks
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-medium">
                  Background Image
                </label>
                <div className="flex flex-col space-y-3">
                  <div className="flex items-center gap-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => fileInputRef.current?.click()}
                      className="flex gap-2"
                    >
                      <Upload className="h-4 w-4" />
                      Upload Image
                    </Button>
                    <Input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      ref={fileInputRef}
                      onChange={handleImageUpload}
                    />
                    
                    {bgImagePreview && (
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={removeImage}
                        className="text-destructive"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Remove
                      </Button>
                    )}
                  </div>
                  
                  {bgImagePreview ? (
                    <div className="relative border rounded-md p-1 max-w-xs">
                      <img 
                        src={bgImagePreview} 
                        alt="Background Preview" 
                        className="w-full h-auto rounded"
                      />
                    </div>
                  ) : (
                    <div className="border border-dashed rounded-md p-8 text-center flex flex-col items-center justify-center text-muted-foreground">
                      <ImageIcon className="h-8 w-8 mb-2" />
                      <p>No background image uploaded</p>
                      <p className="text-xs">Recommended size: 1920x1080px</p>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="darkModeEnabled"
                  checked={settings.darkModeEnabled}
                  onCheckedChange={(checked) => 
                    handleToggleChange('darkModeEnabled', checked)
                  }
                />
                <label 
                  htmlFor="darkModeEnabled" 
                  className="text-sm font-medium cursor-pointer"
                >
                  Enable dark mode by default
                </label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="contact" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
              <CardDescription>
                Contact information displayed on your website
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <label htmlFor="contactEmail" className="text-sm font-medium">
                  Email Address
                </label>
                <Input
                  id="contactEmail"
                  name="contactEmail"
                  type="email"
                  value={settings.contactEmail}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="space-y-1">
                <label htmlFor="contactPhone" className="text-sm font-medium">
                  Phone Number
                </label>
                <Input
                  id="contactPhone"
                  name="contactPhone"
                  value={settings.contactPhone}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="space-y-1">
                <label htmlFor="contactAddress" className="text-sm font-medium">
                  Address
                </label>
                <Textarea
                  id="contactAddress"
                  name="contactAddress"
                  value={settings.contactAddress}
                  onChange={handleInputChange}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="content" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Content Settings</CardTitle>
              <CardDescription>
                Edit website content and text
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-1">
                <label htmlFor="headerContent" className="text-sm font-medium block mb-2">
                  Header Content
                </label>
                <div className="border rounded-md">
                  <ReactQuill
                    theme="snow"
                    value={settings.siteDescription}
                    onChange={(value) => handleRichTextChange('siteDescription', value)}
                    modules={quillModules}
                    formats={quillFormats}
                    placeholder="Edit header content..."
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  This content will be displayed in the header section of your homepage.
                </p>
              </div>
              
              <div className="space-y-1">
                <label htmlFor="footerText" className="text-sm font-medium block mb-2">
                  Footer Content
                </label>
                <div className="border rounded-md">
                  <ReactQuill
                    theme="snow"
                    value={settings.footerText}
                    onChange={(value) => handleRichTextChange('footerText', value)}
                    modules={quillModules}
                    formats={quillFormats}
                    placeholder="Edit footer content..."
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  This content will be displayed in the footer section of your homepage.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <div className="flex justify-end pt-4">
        <Button onClick={handleSaveSettings} className="min-w-[120px]">
          Save Settings
        </Button>
      </div>
    </div>
  );
};

export default SettingsPanel;
