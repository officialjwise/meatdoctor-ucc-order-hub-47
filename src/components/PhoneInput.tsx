
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';

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
  placeholder = "0123 456 789",
  className = ""
}) => {
  const [displayValue, setDisplayValue] = useState('');

  useEffect(() => {
    // Format the value for display
    if (value) {
      if (value.startsWith('+233')) {
        // Convert back to local format for display
        const localNumber = '0' + value.substring(4);
        setDisplayValue(formatPhoneDisplay(localNumber));
      } else if (value.startsWith('0')) {
        setDisplayValue(formatPhoneDisplay(value));
      } else {
        setDisplayValue(formatPhoneDisplay('0' + value));
      }
    } else {
      setDisplayValue('');
    }
  }, [value]);

  const formatPhoneDisplay = (phone: string) => {
    // Remove all non-digits
    const digits = phone.replace(/\D/g, '');
    
    // Format as 0XXX XXX XXX
    if (digits.length <= 4) return digits;
    if (digits.length <= 7) return `${digits.slice(0, 4)} ${digits.slice(4)}`;
    return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7, 10)}`;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let inputValue = e.target.value.replace(/\D/g, ''); // Remove non-digits
    
    // Ensure it starts with 0
    if (inputValue && !inputValue.startsWith('0')) {
      inputValue = '0' + inputValue;
    }
    
    // Limit to 10 digits (0XXXXXXXXX)
    if (inputValue.length > 10) {
      inputValue = inputValue.substring(0, 10);
    }
    
    // Format for display
    const formattedDisplay = formatPhoneDisplay(inputValue);
    setDisplayValue(formattedDisplay);
    
    // If we have 10 digits, convert to international format
    if (inputValue.length === 10 && inputValue.startsWith('0')) {
      const internationalFormat = '+233' + inputValue.substring(1);
      onChange(internationalFormat);
    } else if (inputValue.length === 0) {
      onChange('');
    } else {
      // Store as-is for partial numbers
      onChange(inputValue);
    }
  };

  return (
    <div className="space-y-2">
      {label && <Label htmlFor="phone-input">{label} *</Label>}
      <div className="flex gap-2">
        <Select value="+233" disabled>
          <SelectTrigger className="w-32">
            <SelectValue>
              <div className="flex items-center gap-2">
                <span className="text-lg">🇬🇭</span>
                <span>+233</span>
              </div>
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="+233">
              <div className="flex items-center gap-2">
                <span className="text-lg">🇬🇭</span>
                <span>+233</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
        <Input
          id="phone-input"
          type="tel"
          value={displayValue}
          onChange={handleInputChange}
          placeholder={placeholder}
          className={`flex-1 ${className} ${error ? 'border-red-500' : ''}`}
          maxLength={13} // Max length for display (0XXX XXX XXX)
        />
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <p className="text-xs text-muted-foreground">
        Enter your phone number starting with 0 (e.g., 0123 456 789)
      </p>
    </div>
  );
};

export default PhoneInput;
