import { Loader2 } from 'lucide-react';

export function LoadingSpinner({ size = 24 }: { size?: number }) {
  return (
    <div className="flex justify-center items-center p-4">
      <Loader2 className="animate-spin text-primary" size={size} />
      <span className="sr-only">Loading...</span>
    </div>
  );
}
