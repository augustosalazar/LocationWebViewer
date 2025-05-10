
'use client';

import type { LucideProps } from 'lucide-react'; // Import LucideProps for generic icon type
import { Button } from '@/components/ui/button';
import type React from 'react';

interface EmailListProps {
  emails: string[];
  selectedEmail: string | null;
  onSelectEmail: (email: string) => void;
  IconComponent: React.ComponentType<LucideProps>; // Use a more generic type for Lucide icons
}

export function EmailList({ emails, selectedEmail, onSelectEmail, IconComponent }: EmailListProps) {
  return (
    <div className="space-y-2">
      {emails.map((email) => (
        <Button
          key={email}
          variant={selectedEmail === email ? 'default' : 'outline'}
          onClick={() => onSelectEmail(email)}
          className="w-full justify-start text-left"
        >
          <IconComponent className="mr-2 h-4 w-4" />
          {email}
        </Button>
      ))}
    </div>
  );
}
