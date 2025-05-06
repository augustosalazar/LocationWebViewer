import type { LocationData } from '@/services/location-service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, CalendarDays } from 'lucide-react';

interface LocationCardProps {
  location: LocationData;
}

export function LocationCard({ location }: LocationCardProps) {
  const formattedTimestamp = new Date(location.timestamp).toLocaleString();

  return (
    <Card className="mb-4 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center text-lg">
          <MapPin className="mr-2 h-5 w-5 text-primary" />
          Location Details
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <p><strong>Latitude:</strong> {location.latitude.toFixed(4)}</p>
        <p><strong>Longitude:</strong> {location.longitude.toFixed(4)}</p>
        <div className="flex items-center text-sm text-muted-foreground">
          <CalendarDays className="mr-2 h-4 w-4" />
          <p><strong>Recorded:</strong> {formattedTimestamp}</p>
        </div>
      </CardContent>
    </Card>
  );
}
