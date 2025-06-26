
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Utensils, Clock, MapPin, Star } from 'lucide-react';
import BookingForm from '@/components/BookingForm';
import Footer from '@/components/Footer';

const Index = () => {
  const navigate = useNavigate();
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const [siteInfo, setSiteInfo] = useState({
    siteName: 'MeatDoctor UCC',
    siteDescription: 'Your favorite food delivery service'
  });
  const [error, setError] = useState<string | null>(null);
  const [trackOrderId, setTrackOrderId] = useState('');

  useEffect(() => {
    const fetchPublicSettings = async () => {
      try {
        const response = await fetch('https://meatdoctor-ucc-officialjwise-dev.apps.rm3.7wse.p1.openshiftapps.com/api/settings/public/background-image', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch public settings: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Fetched public settings:', data);
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

  const handleTrackOrder = () => {
    if (trackOrderId.trim()) {
      navigate(`/track-order/${trackOrderId.trim()}`);
    }
  };

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
        className="fixed inset-0 bg-gradient-to-br from-background/40 via-background/60 to-background/80 dark:from-background/60 dark:via-background/80 dark:to-background/90"
        style={{ zIndex: -1 }}
      />
      
      {/* Header */}
      <header className="py-6 px-4 md:px-6 flex items-center justify-between border-b border-border/40 backdrop-blur-md bg-background/20">
        <div className="flex items-center">
          <div className="flex items-center space-x-2">
            <div className="bg-food-primary p-2 rounded-lg">
              <Utensils className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              <span className="text-food-primary">{siteInfo.siteName.split(' ')[0]}</span>
              <span className="text-foreground">{siteInfo.siteName.split(' ').slice(1).join(' ')}</span>
            </h1>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <ThemeToggle />
        </div>
      </header>
      
      {/* Hero Section */}
      <section className="py-12 px-4 md:px-6">
        <div className="container mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h2 className="text-4xl md:text-6xl font-bold tracking-tight">
              <span className="bg-gradient-to-r from-food-primary to-orange-500 bg-clip-text text-transparent">
                Delicious Food
              </span>
              <br />
              <span className="text-foreground">Delivered Fresh</span>
            </h2>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
              Experience the best of local cuisine with fast, reliable delivery to your doorstep
            </p>
          </div>

          {/* Track Order Section */}
          <Card className="max-w-md mx-auto backdrop-blur-sm bg-background/95 border border-border/50">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center justify-center gap-2">
                <Search className="h-5 w-5" />
                Track Your Order
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter your order ID (e.g., MD123456789)"
                  value={trackOrderId}
                  onChange={(e) => setTrackOrderId(e.target.value)}
                  className="flex-1"
                />
                <Button 
                  onClick={handleTrackOrder}
                  disabled={!trackOrderId.trim()}
                  className="bg-food-primary hover:bg-food-primary/90"
                >
                  Track
                </Button>
              </div>
              <p className="text-xs text-muted-foreground text-center">
                Enter your order ID to check the status of your delivery
              </p>
            </CardContent>
          </Card>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <Card className="backdrop-blur-sm bg-background/80 border border-border/50 hover:bg-background/90 transition-colors">
              <CardContent className="p-6 text-center space-y-3">
                <div className="bg-food-primary/10 p-3 rounded-full w-fit mx-auto">
                  <Clock className="h-6 w-6 text-food-primary" />
                </div>
                <h3 className="font-semibold text-lg">Fast Delivery</h3>
                <p className="text-muted-foreground">Quick and reliable delivery to your location</p>
              </CardContent>
            </Card>

            <Card className="backdrop-blur-sm bg-background/80 border border-border/50 hover:bg-background/90 transition-colors">
              <CardContent className="p-6 text-center space-y-3">
                <div className="bg-food-primary/10 p-3 rounded-full w-fit mx-auto">
                  <Utensils className="h-6 w-6 text-food-primary" />
                </div>
                <h3 className="font-semibold text-lg">Fresh Food</h3>
                <p className="text-muted-foreground">Freshly prepared meals with quality ingredients</p>
              </CardContent>
            </Card>

            <Card className="backdrop-blur-sm bg-background/80 border border-border/50 hover:bg-background/90 transition-colors">
              <CardContent className="p-6 text-center space-y-3">
                <div className="bg-food-primary/10 p-3 rounded-full w-fit mx-auto">
                  <Star className="h-6 w-6 text-food-primary" />
                </div>
                <h3 className="font-semibold text-lg">Top Rated</h3>
                <p className="text-muted-foreground">Highly rated by our satisfied customers</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      
      {/* Main content */}
      <main className="flex-1 container mx-auto px-4 md:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Welcome Section */}
          <div className="lg:col-span-4 space-y-6">
            <Card className="backdrop-blur-sm bg-background/90 border border-border/50">
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <MapPin className="h-6 w-6 text-food-primary" />
                  Welcome to Our Restaurant
                </h2>
                {error && <p className="text-red-500 mb-4 text-sm">{error}</p>}
                <div 
                  className="prose dark:prose-invert prose-sm max-w-none" 
                  dangerouslySetInnerHTML={{ __html: siteInfo.siteDescription }} 
                />
              </CardContent>
            </Card>
          </div>
          
          {/* Booking Form */}
          <div className="lg:col-span-8">
            <BookingForm />
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
