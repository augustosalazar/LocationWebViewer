
'use client';

import { useState, useEffect } from 'react';
import { getUsers, type UserData } from '@/services/location-service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/loading-spinner';
import { EmailList } from '@/components/email-list';
import { EmailDetails } from '@/components/email-details';
import { ErrorDisplay } from '@/components/error-display';
import { Users, LayoutDashboard } from 'lucide-react'; // Changed Mail to Users icon

export default function HomePage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [userEmails, setUserEmails] = useState<string[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [errorUsers, setErrorUsers] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUsersData() {
      try {
        setIsLoadingUsers(true);
        setErrorUsers(null);
        const fetchedUsers = await getUsers();
        setUsers(fetchedUsers);
        setUserEmails(fetchedUsers.map(user => user.email));
      } catch (err) {
        console.error('Failed to fetch users:', err);
        setErrorUsers('Failed to load user list. Please try again later.');
      } finally {
        setIsLoadingUsers(false);
      }
    }
    fetchUsersData();
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
            <Users className="mr-2 h-5 w-5 text-primary" /> {/* Changed icon */}
            Select a User
          </CardTitle>
          <CardDescription>Choose a user's email address to view their associated location data.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingUsers && <LoadingSpinner />}
          {errorUsers && !userEmails.length && <ErrorDisplay message={errorUsers} />}
          {!isLoadingUsers && !errorUsers && userEmails.length === 0 && <p className="text-center text-muted-foreground">No users found.</p>}
          {!isLoadingUsers && userEmails.length > 0 && (
            <EmailList
              emails={userEmails}
              selectedEmail={selectedEmail} 
              onSelectEmail={handleSelectEmail}
              IconComponent={Users} // Changed icon prop
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
