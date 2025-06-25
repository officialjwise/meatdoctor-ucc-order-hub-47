
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface PhoneNumberInputProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
}

const PhoneNumberInput: React.FC<PhoneNumberInputProps> = ({
  value,
  onChange,
  label = "Phone Number",
  placeholder = "Enter phone number",
  required = false
}) => {
  const [displayValue, setDisplayValue] = useState(value);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let input = e.target.value.replace(/\D/g, ''); // Remove non-digits
    
    // Remove leading zero if present
    if (input.startsWith('0')) {
      input = input.substring(1);
    }
    
    // Format the display value
    let formatted = input;
    if (input.length > 0) {
      formatted = `+233 ${input}`;
    }
    
    // Update the actual value (with +233 prefix)
    const actualValue = input.length > 0 ? `+233${input}` : '';
    
    setDisplayValue(formatted);
    onChange(actualValue);
  };

  const handleFocus = () => {
    if (!displayValue) {
      setDisplayValue('+233 ');
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="phone" className="text-sm font-medium">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
          <span className="text-lg">🇬🇭</span>
        </div>
        <Input
          id="phone"
          type="tel"
          value={displayValue}
          onChange={handleInputChange}
          onFocus={handleFocus}
          placeholder={placeholder}
          className="pl-16 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
          required={required}
        />
      </div>
    </div>
  );
};

export default PhoneNumberInput;
