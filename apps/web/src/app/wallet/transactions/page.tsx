'use client';

import { TransactionList } from '@/components/wallet/TransactionList';
import Link from 'next/link';

export default function TransactionsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-card rounded-xl border border-border p-6 md:p-8">
          <div className="flex justify-between items-center mb-8">
            <div>
                <h1 className="text-2xl font-bold text-white">Transaction History</h1>
                <p className="text-muted-foreground text-sm mt-1">View all your incoming and outgoing tokens</p>
            </div>
            <Link href="/wallet" className="text-sm text-primary hover:underline font-medium">
              ← Back to Wallet
            </Link>
          </div>

          <TransactionList />
        </div>
      </div>
    </div>
  );
}
