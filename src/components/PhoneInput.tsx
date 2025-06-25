
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
  placeholder = "123 456 789",
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
    if (inputValue.length > 3) {
      formattedDisplay = inputValue.substring(0, 3) + ' ' + inputValue.substring(3);
    }
    if (inputValue.length > 6) {
      formattedDisplay = inputValue.substring(0, 3) + ' ' + inputValue.substring(3, 6) + ' ' + inputValue.substring(6, 9);
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
          maxLength={11} // Max length for display (XXX XXX XXX)
        />
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
};

export default PhoneInput;
