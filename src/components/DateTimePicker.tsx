
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar as CalendarIcon, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface DateTimePickerProps {
  value: string;
  onChange: (dateTime: string) => void;
  placeholder?: string;
  className?: string;
}

const DateTimePicker: React.FC<DateTimePickerProps> = ({
  value,
  onChange,
  placeholder = "Select date and time",
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedHour, setSelectedHour] = useState<string>('');
  const [selectedMinute, setSelectedMinute] = useState<string>('');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('AM');

  // Parse existing value
  useEffect(() => {
    if (value) {
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        setSelectedDate(date);
        const hours = date.getHours();
        const minutes = date.getMinutes();
        const hour12 = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
        setSelectedHour(hour12.toString());
        setSelectedMinute(minutes.toString().padStart(2, '0'));
        setSelectedPeriod(hours < 12 ? 'AM' : 'PM');
      }
    }
  }, [value]);

  const formatDateTime = (date: Date, hour: string, minute: string, period: string) => {
    const hour24 = period === 'AM' 
      ? (hour === '12' ? 0 : parseInt(hour)) 
      : (hour === '12' ? 12 : parseInt(hour) + 12);
    
    const dateTime = new Date(date);
    dateTime.setHours(hour24, parseInt(minute), 0, 0);
    return dateTime.toISOString().slice(0, 16);
  };

  const handleDateTimeSelect = () => {
    if (selectedDate && selectedHour && selectedMinute && selectedPeriod) {
      const dateTimeString = formatDateTime(selectedDate, selectedHour, selectedMinute, selectedPeriod);
      onChange(dateTimeString);
      setIsOpen(false);
    }
  };

  const displayText = value && selectedDate
    ? `${format(selectedDate, 'PPP')} at ${selectedHour}:${selectedMinute.padStart(2, '0')} ${selectedPeriod}`
    : '';

  const hours = Array.from({ length: 12 }, (_, i) => (i + 1).toString());
  const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));

  // Get minimum date (today)
  const getMinDate = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !value && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {displayText || placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="text-center text-sm font-medium">Select Date & Time</div>
              
              {/* Calendar */}
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                disabled={(date) => date < getMinDate()}
                initialFocus
                className="rounded-md border pointer-events-auto"
              />
              
              {/* Time Selection */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm font-medium">Time</span>
                </div>
                
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
              </div>
              
              {/* Confirm Button */}
              <Button 
                onClick={handleDateTimeSelect}
                disabled={!selectedDate || !selectedHour || !selectedMinute || !selectedPeriod}
                className="w-full"
              >
                Confirm Date & Time
              </Button>
            </div>
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
};

export default DateTimePicker;
