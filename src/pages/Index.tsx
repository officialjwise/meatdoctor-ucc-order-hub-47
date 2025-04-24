import React, { useState, useEffect } from 'react';
import { ThemeToggle } from "@/components/ui/theme-toggle";
import BookingForm from '@/components/BookingForm';
import Footer from '@/components/Footer';

const Index = () => {
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const [siteInfo, setSiteInfo] = useState({
    siteName: 'MeatDoctor UCC',
    siteDescription: 'Your favorite food delivery service'
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPublicSettings = async () => {
      try {
        const response = await fetch('/api/settings/public/background-image', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch public settings: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Fetched public settings:', data); // Debug log
        setBackgroundImage(data.backgroundImageUrl || null);
        setSiteInfo({
          siteName: data.siteName || 'MeatDoctor UCC',
          siteDescription: data.siteDescription || 'Your favorite food delivery service'
        });
      } catch (err) {
        console.error('Error fetching public settings:', err);
        setError('Failed to load site settings. Using default values.');
        setBackgroundImage(null);
      }
    };

    fetchPublicSettings();
  }, []);

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Background image with overlay */}
      <div 
        className="fixed inset-0 bg-cover bg-center"
        style={{ 
          backgroundImage: backgroundImage 
            ? `url(${backgroundImage})` 
            : 'url(https://images.unsplash.com/photo-1561758033-d89a9ad46330?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1770&q=80)',
          zIndex: -2 
        }}
      />
      <div 
        className="fixed inset-0 bg-background/40 dark:bg-background/70"
        style={{ zIndex: -1 }}
      />
      
      {/* Header */}
      <header className="py-6 px-4 md:px-6 flex items-center justify-between border-b border-border/40 backdrop-blur-sm">
        <div className="flex items-center">
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            <span className="text-food-primary">{siteInfo.siteName.split(' ')[0]}</span>
            <span>{siteInfo.siteName.split(' ').slice(1).join(' ')}</span>
          </h1>
        </div>
        
        <div className="flex items-center gap-4">
          <a href="/admin" className="text-sm hover:underline">Admin</a>
          <ThemeToggle />
        </div>
      </header>
      
      {/* Main content */}
      <main className="flex-1 container mx-auto px-4 md:px-6 py-8 grid items-start gap-6 md:gap-8">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="md:w-2/5 space-y-6">
            <div className="backdrop-blur-sm bg-background/50 dark:bg-background/50 p-6 rounded-lg border border-border/40">
              <h2 className="text-3xl font-bold mb-4">Welcome to Our Restaurant</h2>
              {error && <p className="text-red-500 mb-4">{error}</p>}
              <div className="prose dark:prose-invert" dangerouslySetInnerHTML={{ __html: siteInfo.siteDescription }} />
            </div>
          </div>
          
          <div className="md:w-3/5">
            <BookingForm />
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;