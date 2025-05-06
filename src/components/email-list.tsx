'use client';

import type { Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmailListProps {
  emails: string[];
  selectedEmail: string | null;
  onSelectEmail: (email: string) => void;
  IconComponent: typeof Mail; // To avoid direct import of lucide-react here
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
