
'use client';

import { useState, useEffect, type SetStateAction } from 'react';
import dynamic from 'next/dynamic';
import { getLocationsByEmail, type LocationData } from '@/services/location-service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/loading-spinner';
import { LocationCard } from '@/components/location-card';
import { ErrorDisplay } from '@/components/error-display';
import { DatePicker } from '@/components/date-picker';
import { ArrowLeft, MapPin, ListFilter, CalendarDays } from 'lucide-react';
import { format, isSameDay } from 'date-fns';

const LocationMap = dynamic(() => import('@/components/location-map').then(mod => mod.LocationMap), {
  ssr: false,
  loading: () => <div className="flex-grow flex justify-center items-center h-full w-full rounded-lg shadow-md bg-muted"><LoadingSpinner size={32} /><p className="ml-2">Loading map...</p></div>,
});

interface EmailDetailsProps {
  email: string;
  onBack: () => void;
}

export function EmailDetails({ email, onBack }: EmailDetailsProps) {
  const [locations, setLocations] = useState<LocationData[]>([]);
  const [filteredLocations, setFilteredLocations] = useState<LocationData[]>([]);
  const [isLoadingLocations, setIsLoadingLocations] = useState(true);
  const [errorLocations, setErrorLocations] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  useEffect(() => {
    async function fetchLocations() {
      if (!email) return;
      try {
        setIsLoadingLocations(true);
        setErrorLocations(null);
        setLocations([]);
        setFilteredLocations([]);
        const fetchedLocations = await getLocationsByEmail(email);
        setLocations(fetchedLocations);
        // Initial filter application
        if (!selectedDate) {
          setFilteredLocations(fetchedLocations);
        } else {
          setFilteredLocations(fetchedLocations.filter(loc => isSameDay(new Date(loc.timestamp), selectedDate)));
        }
      } catch (err) {
        console.error(`Failed to fetch locations for ${email}:`, err);
        setErrorLocations(`Failed to load locations for ${email}. Please try again later.`);
      } finally {
        setIsLoadingLocations(false);
      }
    }
    fetchLocations();
  }, [email]);

  useEffect(() => {
    if (!selectedDate) {
      setFilteredLocations(locations);
    } else {
      const newFiltered = locations.filter(location =>
        isSameDay(new Date(location.timestamp), selectedDate)
      );
      setFilteredLocations(newFiltered);
    }
  }, [locations, selectedDate]);

  const handleDateChange = (date: SetStateAction<Date | undefined>) => {
    setSelectedDate(date);
  };

  return (
    <div className="flex flex-col h-screen p-2 sm:p-4 bg-background">
      <header className="mb-4">
        <Card className="shadow-md">
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div className="flex items-center">
                <Button variant="ghost" size="icon" onClick={onBack} className="mr-2 text-primary hover:bg-primary/10">
                  <ArrowLeft className="h-5 w-5" />
                  <span className="sr-only">Back to email list</span>
                </Button>
                <CardTitle className="text-xl sm:text-2xl flex items-center">
                  <MapPin className="mr-2 h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                  Locations for {email}
                </CardTitle>
              </div>
              <div className="flex items-center gap-2 self-end sm:self-center">
                 <DatePicker date={selectedDate} setDate={handleDateChange} />
              </div>
            </div>
             <CardDescription className="mt-2 pl-10 sm:pl-12">
                {isLoadingLocations ? 'Loading location data...' : 
                 filteredLocations.length > 0 ? 
                    `Showing ${filteredLocations.length} location(s)${selectedDate ? ` on ${format(selectedDate, 'PPP')}` : ''}.` :
                    selectedDate ? `No locations found on ${format(selectedDate, 'PPP')}.` : 'No locations found for this email.'
                }
            </CardDescription>
          </CardHeader>
        </Card>
      </header>

      {errorLocations && (
        <div className="flex-grow flex items-center justify-center">
          <ErrorDisplay message={errorLocations} />
        </div>
      )}

      {!errorLocations && (
        <div className="flex-grow grid grid-cols-1 lg:grid-cols-3 gap-4 overflow-hidden">
          {isLoadingLocations && (
             <div className="lg:col-span-3 flex justify-center items-center h-full">
                <LoadingSpinner size={64} />
             </div>
          )}
          {!isLoadingLocations && locations.length === 0 && (
            <div className="lg:col-span-3 flex flex-col items-center justify-center text-center p-8 h-full">
                <MapPin size={64} className="text-muted-foreground mb-4" />
                <p className="text-xl text-muted-foreground">No location data available for this email.</p>
            </div>
          )}
          {!isLoadingLocations && locations.length > 0 && filteredLocations.length === 0 && selectedDate && (
             <div className="lg:col-span-3 flex flex-col items-center justify-center text-center p-8 h-full">
                <CalendarDays size={64} className="text-muted-foreground mb-4" />
                <p className="text-xl text-muted-foreground">No locations found for the selected date: {format(selectedDate, 'PPP')}.</p>
                <p className="text-sm text-muted-foreground mt-2">Try clearing the date filter or selecting another date.</p>
            </div>
          )}

          {!isLoadingLocations && filteredLocations.length > 0 && (
            <>
              <Card className="lg:col-span-1 shadow-lg flex flex-col overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center">
                    <ListFilter className="mr-2 h-5 w-5 text-primary" />
                    Location List
                  </CardTitle>
                  <CardDescription>
                    {selectedDate ? `Filtered by ${format(selectedDate, 'PPP')}` : 'All recorded locations.'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow overflow-y-auto pt-2 pr-1">
                  {filteredLocations.map((location) => (
                    <LocationCard key={location.id} location={location} />
                  ))}
                </CardContent>
              </Card>

              <Card className="lg:col-span-2 shadow-lg flex flex-col overflow-hidden">
                <CardHeader className="pb-2">
                   <CardTitle className="text-lg flex items-center">
                        <MapPin className="mr-2 h-5 w-5 text-primary" />
                        Map View
                    </CardTitle>
                    <CardDescription>Locations visualized on OpenStreetMap.</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow flex p-0"> {/* Modified to p-0 and flex to allow map to fill */}
                  <LocationMap locations={filteredLocations} />
                </CardContent>
              </Card>
            </>
          )}
        </div>
      )}
    </div>
  );
}
