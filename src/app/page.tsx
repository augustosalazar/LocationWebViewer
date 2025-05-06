'use client';

import { useState, useEffect } from 'react';
import { getEmails, getLocationsByEmail, type LocationData } from '@/services/location-service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/loading-spinner';
import { EmailList } from '@/components/email-list';
import { LocationCard } from '@/components/location-card';
import { ErrorDisplay } from '@/components/error-display';
import { Mail, MapPin } from 'lucide-react';

export default function HomePage() {
  const [emails, setEmails] = useState<string[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null);
  const [locations, setLocations] = useState<LocationData[]>([]);
  const [isLoadingEmails, setIsLoadingEmails] = useState(true);
  const [isLoadingLocations, setIsLoadingLocations] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchEmails() {
      try {
        setIsLoadingEmails(true);
        setError(null);
        const fetchedEmails = await getEmails();
        setEmails(fetchedEmails);
      } catch (err) {
        console.error('Failed to fetch emails:', err);
        setError('Failed to load email list. Please try again later.');
      } finally {
        setIsLoadingEmails(false);
      }
    }
    fetchEmails();
  }, []);

  const handleSelectEmail = async (email: string) => {
    setSelectedEmail(email);
    try {
      setIsLoadingLocations(true);
      setError(null);
      setLocations([]); // Clear previous locations
      const fetchedLocations = await getLocationsByEmail(email);
      setLocations(fetchedLocations);
    } catch (err) {
      console.error(`Failed to fetch locations for ${email}:`, err);
      setError(`Failed to load locations for ${email}. Please try again later.`);
    } finally {
      setIsLoadingLocations(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="md:col-span-1 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Mail className="mr-2 h-5 w-5 text-primary" />
            Emails
          </CardTitle>
          <CardDescription>Select an email to view its locations.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingEmails && <LoadingSpinner />}
          {error && !emails.length && <ErrorDisplay message={error} />}
          {!isLoadingEmails && !error && emails.length === 0 && <p>No emails found.</p>}
          {!isLoadingEmails && emails.length > 0 && (
            <EmailList
              emails={emails}
              selectedEmail={selectedEmail}
              onSelectEmail={handleSelectEmail}
              IconComponent={Mail}
            />
          )}
        </CardContent>
      </Card>

      <div className="md:col-span-2">
        {selectedEmail && (
          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="mr-2 h-5 w-5 text-primary" />
                Locations for {selectedEmail}
              </CardTitle>
              <CardDescription>Showing recorded locations for the selected email.</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingLocations && <LoadingSpinner size={32} />}
              {error && !isLoadingLocations && <ErrorDisplay message={error} />}
              {!isLoadingLocations && !error && locations.length === 0 && <p>No locations found for this email.</p>}
              {!isLoadingLocations && locations.length > 0 && (
                <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                  {locations.map((location) => (
                    <LocationCard key={location.id} location={location} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
        {!selectedEmail && !isLoadingEmails && (
          <Card className="shadow-xl flex flex-col items-center justify-center min-h-[200px]">
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
