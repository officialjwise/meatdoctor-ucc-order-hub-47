
import React, { useState, useEffect } from 'react';
import { getSiteSettings } from '@/lib/storage';
import { useTheme } from '@/hooks/use-theme';

const Footer = () => {
  const { theme } = useTheme();
  const [footerText, setFooterText] = useState('© 2023 MeatDoctor UCC. All rights reserved.');
  
  useEffect(() => {
    const settings = getSiteSettings();
    if (settings && settings.footerText) {
      setFooterText(settings.footerText);
    }
  }, []);
  
  return (
    <footer className={`mt-auto py-6 ${theme === 'dark' ? 'bg-gray-900 text-gray-200' : 'bg-gray-100 text-gray-700'}`}>
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <div className="flex items-center">
              <h3 className="text-xl font-bold flex items-center">
                <span className="text-food-primary">Meat</span>Doctor
                <span className="text-food-secondary">Ucc</span>
              </h3>
            </div>
          </div>
          
          <div className="text-sm md:text-base text-center md:text-right" 
            dangerouslySetInnerHTML={{ __html: footerText }} 
          />
        </div>
      </div>
    </footer>
  );
};

export default Footer;
