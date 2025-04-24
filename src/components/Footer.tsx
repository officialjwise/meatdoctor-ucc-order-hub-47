import React, { useState, useEffect } from 'react';
import Sweetalert2 from 'sweetalert2';
import DOMPurify from 'dompurify';

const BACKEND_URL = 'http://localhost:4000';

const Footer = () => {
  const [siteName, setSiteName] = useState('MeatDoctor UCC');
  const [siteDescription, setSiteDescription] = useState('Your favorite food delivery service');
  const [footerText, setFooterText] = useState('© 2025 MeatDoctor UCC. All rights reserved.');

  const fetchSettings = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/public/background-image`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Fetch error response:', errorData);
        throw new Error(
          `Failed to fetch settings (Status: ${response.status}): ${errorData.slice(0, 200)}`
        );
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Non-JSON response:', text);
        throw new Error(`Received non-JSON response: ${text.slice(0, 200)}`);
      }

      const data = await response.json();
      console.log('Received data:', data); // Debug: Log the received data
      
      // Check if the data contains HTML tags
      setSiteName(data.siteName || 'MeatDoctor UCC');
      setSiteDescription(data.siteDescription || 'Your favorite food delivery service');
      setFooterText(data.footerText || '© 2025 MeatDoctor UCC. All rights reserved.');
    } catch (error) {
      console.error('Error fetching settings:', error);
      Sweetalert2.fire({
        title: 'Error',
        text: error.message || 'Failed to load site settings. Using defaults.',
        icon: 'error',
      });
    }
  };

  useEffect(() => {
    fetchSettings();
    // Poll for updates every 30 seconds
    const interval = setInterval(fetchSettings, 30000);
    return () => clearInterval(interval);
  }, []);

  // Debug: Check if the text contains HTML tags
  const containsHTML = (text) => /<[a-z][\s\S]*>/i.test(text);
  
  console.log('siteDescription contains HTML:', containsHTML(siteDescription));
  console.log('footerText contains HTML:', containsHTML(footerText));

  return (
    <footer className="bg-gray-800 text-white py-4">
      <div className="container mx-auto text-center">
        <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(footerText) }} />
        <div className="text-sm" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(siteDescription) }} />
      </div>
    </footer>
  );
};

export default Footer;