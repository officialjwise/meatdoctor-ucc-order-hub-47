
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
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
  const [selectedHour, setSelectedHour] = useState<number | null>(null);
  const [selectedMinute, setSelectedMinute] = useState<number | null>(null);
  const [isAM, setIsAM] = useState(true);
  
  const clockRef = useRef<HTMLDivElement>(null);

  // Parse existing time value
  useEffect(() => {
    if (value) {
      const [hours, minutes] = value.split(':').map(Number);
      const hour12 = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
      setSelectedHour(hour12);
      setSelectedMinute(minutes);
      setIsAM(hours < 12);
    }
  }, [value]);

  const formatTime = (hour: number, minute: number, am: boolean) => {
    const hour24 = am ? (hour === 12 ? 0 : hour) : (hour === 12 ? 12 : hour + 12);
    return `${hour24.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  };

  const formatDisplayTime = (hour: number, minute: number, am: boolean) => {
    return `${hour}:${minute.toString().padStart(2, '0')} ${am ? 'AM' : 'PM'}`;
  };

  const handleTimeSelect = () => {
    if (selectedHour !== null && selectedMinute !== null) {
      const timeString = formatTime(selectedHour, selectedMinute, isAM);
      onChange(timeString);
      setIsOpen(false);
    }
  };

  const getClockPosition = (value: number, max: number, radius: number) => {
    const angle = (value * 360) / max - 90;
    const radian = (angle * Math.PI) / 180;
    return {
      x: radius + radius * 0.8 * Math.cos(radian),
      y: radius + radius * 0.8 * Math.sin(radian)
    };
  };

  const handleClockClick = (event: React.MouseEvent, isHourMode: boolean) => {
    if (!clockRef.current) return;
    
    const rect = clockRef.current.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const x = event.clientX - rect.left - centerX;
    const y = event.clientY - rect.top - centerY;
    
    let angle = Math.atan2(y, x) * 180 / Math.PI + 90;
    if (angle < 0) angle += 360;
    
    if (isHourMode) {
      const hour = Math.round(angle / 30) || 12;
      setSelectedHour(hour > 12 ? hour - 12 : hour);
    } else {
      const minute = Math.round(angle / 6) * 1;
      setSelectedMinute(minute >= 60 ? 0 : minute);
    }
  };

  const displayTime = value && selectedHour !== null && selectedMinute !== null 
    ? formatDisplayTime(selectedHour, selectedMinute, isAM)
    : '';

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
              {/* Clock Display */}
              <div 
                ref={clockRef}
                className="relative w-48 h-48 mx-auto cursor-pointer"
                onClick={(e) => handleClockClick(e, selectedMinute === null)}
              >
                {/* Clock Face */}
                <div className="absolute inset-0 rounded-full border-2 border-border bg-background">
                  {/* Hour markers */}
                  {Array.from({ length: 12 }, (_, i) => {
                    const hour = i === 0 ? 12 : i;
                    const pos = getClockPosition(i, 12, 96);
                    return (
                      <div
                        key={`hour-${i}`}
                        className="absolute w-8 h-8 flex items-center justify-center text-sm font-medium transform -translate-x-1/2 -translate-y-1/2"
                        style={{ left: pos.x, top: pos.y }}
                      >
                        {hour}
                      </div>
                    );
                  })}
                  
                  {/* Minute markers (every 5 minutes) */}
                  {selectedHour !== null && Array.from({ length: 12 }, (_, i) => {
                    const minute = i * 5;
                    const pos = getClockPosition(i, 12, 96);
                    return (
                      <div
                        key={`minute-${i}`}
                        className="absolute w-6 h-6 flex items-center justify-center text-xs text-muted-foreground transform -translate-x-1/2 -translate-y-1/2"
                        style={{ left: pos.x, top: pos.y }}
                      >
                        {minute.toString().padStart(2, '0')}
                      </div>
                    );
                  })}
                  
                  {/* Center dot */}
                  <div className="absolute w-2 h-2 bg-primary rounded-full top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                  
                  {/* Hour hand */}
                  {selectedHour !== null && (
                    <div
                      className="absolute w-0.5 bg-primary origin-bottom transform -translate-x-1/2"
                      style={{
                        height: '50px',
                        left: '50%',
                        top: '50%',
                        transformOrigin: 'bottom',
                        transform: `translateX(-50%) rotate(${(selectedHour * 30) - 90}deg)`
                      }}
                    />
                  )}
                  
                  {/* Minute hand */}
                  {selectedMinute !== null && (
                    <div
                      className="absolute w-0.5 bg-secondary origin-bottom transform -translate-x-1/2"
                      style={{
                        height: '70px',
                        left: '50%',
                        top: '50%',
                        transformOrigin: 'bottom',
                        transform: `translateX(-50%) rotate(${(selectedMinute * 6) - 90}deg)`
                      }}
                    />
                  )}
                </div>
              </div>
              
              {/* Instructions */}
              <div className="text-center text-sm text-muted-foreground">
                {selectedHour === null ? 'Click to select hour' : 
                 selectedMinute === null ? 'Click to select minutes' : 
                 'Time selected'}
              </div>
              
              {/* AM/PM Toggle */}
              <div className="flex justify-center space-x-2">
                <Button
                  size="sm"
                  variant={isAM ? "default" : "outline"}
                  onClick={() => setIsAM(true)}
                >
                  AM
                </Button>
                <Button
                  size="sm"
                  variant={!isAM ? "default" : "outline"}
                  onClick={() => setIsAM(false)}
                >
                  PM
                </Button>
              </div>
              
              {/* Confirm Button */}
              <Button 
                onClick={handleTimeSelect}
                disabled={selectedHour === null || selectedMinute === null}
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
