'use client';

import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useSSE } from '@/hooks/useSSE';
import { StatsCards } from '@/components/dashboard/StatsCards';
import { ActiveEvents } from '@/components/dashboard/ActiveEvents';
import { WalletCard } from '@/components/dashboard/WalletCard';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  useSSE();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background text-white">
      {/* Simple Dashboard Header (Navbar already in layout) */}
      <div className="bg-card/50 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-white">Dashboard</h1>
              <p className="text-muted-foreground text-sm">Welcome back, {user.name}</p>
            </div>
            <div className="flex items-center gap-4">
              <NotificationBell />
              <span className="bg-primary text-primary-foreground/20 text-primary text-xs font-bold px-3 py-1 rounded-full uppercase">
                {user.userType}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <StatsCards />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          <div className="lg:col-span-2 space-y-6">
            <ActiveEvents />
          </div>
          <div className="space-y-6">
            <WalletCard />
            <QuickActions />
          </div>
        </div>
      </main>
    </div>
  );
}