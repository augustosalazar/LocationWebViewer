'use client';

import { useState, useEffect } from 'react';
import { getEmails } from '@/services/location-service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/loading-spinner';
import { EmailList } from '@/components/email-list';
import { EmailDetails } from '@/components/email-details';
import { ErrorDisplay } from '@/components/error-display';
import { Mail, LayoutDashboard } from 'lucide-react';

export default function HomePage() {
  const [emails, setEmails] = useState<string[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null);
  const [isLoadingEmails, setIsLoadingEmails] = useState(true);
  const [errorEmails, setErrorEmails] = useState<string | null>(null);

  useEffect(() => {
    async function fetchEmails() {
      try {
        setIsLoadingEmails(true);
        setErrorEmails(null);
        const fetchedEmails = await getEmails();
        setEmails(fetchedEmails);
      } catch (err) {
        console.error('Failed to fetch emails:', err);
        setErrorEmails('Failed to load email list. Please try again later.');
      } finally {
        setIsLoadingEmails(false);
      }
    }
    fetchEmails();
  }, []);

  const handleSelectEmail = (email: string) => {
    setSelectedEmail(email);
  };

  const handleBackToEmailList = () => {
    setSelectedEmail(null);
  };

  if (selectedEmail) {
    return <EmailDetails email={selectedEmail} onBack={handleBackToEmailList} />;
  }

  return (
    <div className="container mx-auto p-4 flex justify-center items-start min-h-screen">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Mail className="mr-2 h-5 w-5 text-primary" />
            Select an Email
          </CardTitle>
          <CardDescription>Choose an email address to view its associated location data.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingEmails && <LoadingSpinner />}
          {errorEmails && !emails.length && <ErrorDisplay message={errorEmails} />}
          {!isLoadingEmails && !errorEmails && emails.length === 0 && <p className="text-center text-muted-foreground">No emails found.</p>}
          {!isLoadingEmails && emails.length > 0 && (
            <EmailList
              emails={emails}
              selectedEmail={selectedEmail} // This will always be null here, but kept for prop consistency
              onSelectEmail={handleSelectEmail}
              IconComponent={Mail}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
