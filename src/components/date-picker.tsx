
'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, X } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface DatePickerProps {
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
  className?: string;
}

export function DatePicker({ date, setDate, className }: DatePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  const handleDateSelect = (selectedDay: Date | undefined) => {
    setDate(selectedDay);
    setIsOpen(false); // Close popover after selecting a date
  };
  
  const clearDate = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation(); // Prevent PopoverTrigger from opening
    setDate(undefined);
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant={'outline'}
            className={cn(
              'w-[240px] justify-start text-left font-normal',
              !date && 'text-muted-foreground'
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, 'PPP') : <span>Filter by date</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleDateSelect}
            initialFocus
          />
        </PopoverContent>
      </Popover>
      {date && (
        <Button
            variant="ghost"
            size="icon"
            onClick={clearDate}
            aria-label="Clear date filter"
            className="h-9 w-9"
          >
            <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
