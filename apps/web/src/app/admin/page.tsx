
// apps/web/src/app/admin/page.tsx
'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { ApprovalQueue } from '@/components/admin/ApprovalQueue';
import { DynamicPricing } from '@/components/admin/DynamicPricing';
import { StatsOverview } from '@/components/admin/StatsOverview';

export default function AdminPanel() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && (!user || user.userType !== 'admin')) {
      router.push('/');
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-background text-white p-8">
      <h1 className="text-3xl font-bold mb-8 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
        Admin Control Center
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <StatsOverview />
          <ApprovalQueue />
        </div>
        <div>
          <DynamicPricing />
        </div>
      </div>
    </div>
  );
}