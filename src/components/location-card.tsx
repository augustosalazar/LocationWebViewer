import type { LocationData } from '@/services/location-service';
import { Card, CardContent } from '@/components/ui/card'; // Removed CardHeader and CardTitle as they are not used
import { MapPin, CalendarDays, Clock } from 'lucide-react'; // Added Clock icon
import { format } from 'date-fns';

interface LocationCardProps {
  location: LocationData;
}

export function LocationCard({ location }: LocationCardProps) {
  const date = new Date(location.timestamp);
  const formattedDate = format(date, 'MMM dd, yyyy');
  const formattedTime = format(date, 'p');

  return (
    <Card className="mb-2 shadow-md hover:shadow-lg transition-shadow duration-200 rounded-md">
      <CardContent className="p-3 space-y-1 text-xs sm:text-sm">
        <div className="flex items-center font-medium text-primary">
          <MapPin className="mr-1.5 h-3.5 w-3.5 sm:h-4 sm:w-4" />
          <span>Lat: {location.latitude.toFixed(4)}, Lng: {location.longitude.toFixed(4)}</span>
        </div>
        <div className="flex items-center text-muted-foreground">
          <CalendarDays className="mr-1.5 h-3.5 w-3.5 sm:h-4 sm:w-4" />
          <span>{formattedDate}</span>
        </div>
        <div className="flex items-center text-muted-foreground">
          <Clock className="mr-1.5 h-3.5 w-3.5 sm:h-4 sm:w-4" />
          <span>{formattedTime}</span>
        </div>
      </CardContent>
    </Card>
  );
}