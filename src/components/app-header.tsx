import { MapPin } from 'lucide-react';

export function AppHeader() {
  return (
    <header className="bg-primary text-primary-foreground p-4 shadow-md">
      <div className="container mx-auto flex items-center gap-2">
        <MapPin size={28} />
        <h1 className="text-2xl font-bold">Location Viewer</h1>
      </div>
    </header>
  );
}
