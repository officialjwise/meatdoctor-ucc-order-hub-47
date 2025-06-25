
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ClockTimePickerProps {
  value: string;
  onChange: (time: string) => void;
  placeholder?: string;
}

const ClockTimePicker: React.FC<ClockTimePickerProps> = ({
  value,
  onChange,
  placeholder = "Select time"
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedHour, setSelectedHour] = useState<string>('');
  const [selectedMinute, setSelectedMinute] = useState<string>('');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('AM');

  // Parse existing time value
  useEffect(() => {
    if (value) {
      const [hours, minutes] = value.split(':').map(Number);
      const hour12 = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
      setSelectedHour(hour12.toString());
      setSelectedMinute(minutes.toString().padStart(2, '0'));
      setSelectedPeriod(hours < 12 ? 'AM' : 'PM');
    }
  }, [value]);

  const formatTime = (hour: string, minute: string, period: string) => {
    const hour24 = period === 'AM' 
      ? (hour === '12' ? 0 : parseInt(hour)) 
      : (hour === '12' ? 12 : parseInt(hour) + 12);
    return `${hour24.toString().padStart(2, '0')}:${minute.padStart(2, '0')}`;
  };

  const formatDisplayTime = (hour: string, minute: string, period: string) => {
    return `${hour}:${minute.padStart(2, '0')} ${period}`;
  };

  const handleTimeSelect = () => {
    if (selectedHour && selectedMinute && selectedPeriod) {
      const timeString = formatTime(selectedHour, selectedMinute, selectedPeriod);
      onChange(timeString);
      setIsOpen(false);
    }
  };

  const displayTime = value && selectedHour && selectedMinute && selectedPeriod
    ? formatDisplayTime(selectedHour, selectedMinute, selectedPeriod)
    : '';

  const hours = Array.from({ length: 12 }, (_, i) => (i + 1).toString());
  const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !value && "text-muted-foreground"
          )}
        >
          <Clock className="mr-2 h-4 w-4" />
          {displayTime || placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="text-center text-sm font-medium">Select Time</div>
              
              {/* Time Selection Dropdowns */}
              <div className="grid grid-cols-3 gap-3">
                {/* Hour Selection */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">Hour</label>
                  <Select value={selectedHour} onValueChange={setSelectedHour}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Hr" />
                    </SelectTrigger>
                    <SelectContent>
                      {hours.map((hour) => (
                        <SelectItem key={hour} value={hour}>
                          {hour}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Minute Selection */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">Minute</label>
                  <Select value={selectedMinute} onValueChange={setSelectedMinute}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Min" />
                    </SelectTrigger>
                    <SelectContent className="max-h-40">
                      {minutes.map((minute) => (
                        <SelectItem key={minute} value={minute}>
                          {minute}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* AM/PM Selection */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">Period</label>
                  <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AM">AM</SelectItem>
                      <SelectItem value="PM">PM</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {/* Confirm Button */}
              <Button 
                onClick={handleTimeSelect}
                disabled={!selectedHour || !selectedMinute || !selectedPeriod}
                className="w-full"
              >
                Confirm Time
              </Button>
            </div>
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
};

export default ClockTimePicker;
