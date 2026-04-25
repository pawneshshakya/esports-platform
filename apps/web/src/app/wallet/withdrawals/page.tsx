'use client';

import { WithdrawalList } from '@/components/wallet/WithdrawalList';
import Link from 'next/link';

export default function WithdrawalsHistoryPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-card rounded-xl border border-border p-6 md:p-8">
          <div className="flex justify-between items-center mb-8">
            <div>
                <h1 className="text-2xl font-bold text-white">Withdrawal History</h1>
                <p className="text-muted-foreground text-sm mt-1">Track the status of your withdrawal requests</p>
            </div>
            <div className="flex gap-4">
              <Link href="/wallet/withdraw" className="text-sm bg-primary/20 text-primary px-3 py-1.5 rounded-lg hover:bg-primary/30 transition-colors font-medium">
                New Request
              </Link>
              <Link href="/wallet" className="text-sm text-muted-foreground hover:text-white pt-1.5">
                ← Back
              </Link>
            </div>
          </div>

          <WithdrawalList />
        </div>
      </div>
    </div>
  );
}
