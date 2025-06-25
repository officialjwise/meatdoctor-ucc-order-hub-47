
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  label?: string;
  placeholder?: string;
  className?: string;
}

const PhoneInput: React.FC<PhoneInputProps> = ({
  value,
  onChange,
  error,
  label = "Phone Number",
  placeholder = "XX XXX XXXX",
  className = ""
}) => {
  const [displayValue, setDisplayValue] = useState('');

  useEffect(() => {
    // Format the value for display
    if (value) {
      if (value.startsWith('+233')) {
        setDisplayValue(value.substring(4));
      } else if (value.startsWith('233')) {
        setDisplayValue(value.substring(3));
      } else if (value.startsWith('0')) {
        setDisplayValue(value.substring(1));
      } else {
        setDisplayValue(value);
      }
    } else {
      setDisplayValue('');
    }
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let inputValue = e.target.value.replace(/\D/g, ''); // Remove non-digits
    
    // Remove leading zero if present
    if (inputValue.startsWith('0')) {
      inputValue = inputValue.substring(1);
    }
    
    // Format for display (add spaces for readability)
    let formattedDisplay = inputValue;
    if (inputValue.length > 2) {
      formattedDisplay = inputValue.substring(0, 2) + ' ' + inputValue.substring(2);
    }
    if (inputValue.length > 5) {
      formattedDisplay = inputValue.substring(0, 2) + ' ' + inputValue.substring(2, 5) + ' ' + inputValue.substring(5, 9);
    }
    
    setDisplayValue(formattedDisplay);
    
    // Send the full international format to parent
    if (inputValue) {
      onChange(`+233${inputValue}`);
    } else {
      onChange('');
    }
  };

  return (
    <div className="space-y-2">
      {label && <Label htmlFor="phone-input">{label}</Label>}
      <div className="relative">
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2 pointer-events-none">
          <span className="text-2xl">🇬🇭</span>
          <span className="text-sm text-muted-foreground">+233</span>
        </div>
        <Input
          id="phone-input"
          type="tel"
          value={displayValue}
          onChange={handleInputChange}
          placeholder={placeholder}
          className={`pl-20 ${className} ${error ? 'border-red-500' : ''}`}
          maxLength={11} // Max length for display (XX XXX XXXX)
        />
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
};

export default PhoneInput;
