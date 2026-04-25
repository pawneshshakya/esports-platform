
'use client';

import { useAuth } from '@/context/AuthContext';

interface Props {
  slot: string;
  className?: string;
}

export const AdBanner = ({ slot, className = '' }: Props) => {
  const { user } = useAuth();

  // Premium users ko ads nahi dikhengi
  if (user?.role === 'premium' || user?.subscription?.type === 'premium') {
    return null;
  }

  return (
    <div className={`bg-muted/50 border border-border rounded-lg p-4 text-center ${className}`}>
      <span className="text-xs text-muted-foreground uppercase tracking-wider">Advertisement</span>
      <div className="mt-2 h-32 flex items-center justify-center bg-card rounded border border-dashed border-border">
        <span className="text-gray-600 text-sm">Ad Slot: {slot}</span>
      </div>
    </div>
  );
};