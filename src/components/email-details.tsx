
import { useEffect, useState } from "react";

import { Card, CardContent } from "@/components/ui/card";
import { LocationData } from "@/services/location-service";
import { LocationMap } from "@/components/location-map";
import { MapPin } from "lucide-react";

interface EmailDetailsProps {
  selectedEmail: string | null;
  isLoadingEmails: boolean;
}

export function EmailDetails({ selectedEmail, isLoadingEmails }: EmailDetailsProps) {
  const [locations, setLocations] = useState<LocationData[]>([]);
  const [isLoadingLocations, setIsLoadingLocations] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLocations = async () => {
      if (!selectedEmail) {
        setLocations([]);
        return;
      }

      setIsLoadingLocations(true);
      setError(null);

      try {
        const response = await fetch(`/api/locations?email=${selectedEmail}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch locations: ${response.status}`);
        }
        const data = await response.json();
        setLocations(data);
      } catch (e: any) {
        setError(e.message || "Failed to fetch locations");
        setLocations([]);
      } finally {
        setIsLoadingLocations(false);
      }
    };

    fetchLocations();
  }, [selectedEmail]);

  // Filter out locations that have null or undefined latitude or longitude
  const filteredLocations = locations.filter(
    (loc) => loc.latitude != null && loc.longitude != null
  );

  return (
    <div className="flex flex-col h-full">
      <div className="flex-grow">
        {selectedEmail && !isLoadingEmails && (
          <>
            {isLoadingLocations && <p>Loading location data...</p>}
            {error && <p>Error: {error}</p>}
            {filteredLocations && filteredLocations.length > 0 ? (
              <LocationMap locations={filteredLocations} />
            ) : (
              <Card className="shadow-xl flex flex-col items-center justify-center min-h-[200px] lg:min-h-[calc(100vh-10rem)]">
                <CardContent className="text-center">
                  <MapPin size={48} className="mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No location data found for this email.</p>
                </CardContent>
              </Card>
            )}
          </>
        )}
        {!selectedEmail && !isLoadingEmails && (
          <Card className="shadow-xl flex flex-col items-center justify-center min-h-[200px] lg:min-h-[calc(100vh-10rem)]">
            <CardContent className="text-center">
              <MapPin size={48} className="mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Select an email from the list to see location data.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}


