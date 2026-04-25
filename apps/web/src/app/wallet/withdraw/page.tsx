'use client';

import { WithdrawalForm } from '@/components/wallet/WithdrawalForm';
import Link from 'next/link';

export default function WithdrawPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="bg-card rounded-xl border border-border p-6 md:p-8">
          <div className="flex justify-between items-center mb-8">
            <div>
                <h1 className="text-2xl font-bold text-white">Request Withdrawal</h1>
                <p className="text-muted-foreground text-sm mt-1">Withdraw tokens to your Bank or UPI</p>
            </div>
            <Link href="/wallet" className="text-sm text-primary hover:underline font-medium">
              ← Back to Wallet
            </Link>
          </div>

          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mb-8">
            <h3 className="font-semibold text-white mb-2 flex items-center gap-2">
                <span>ℹ️</span> Important Information
            </h3>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-5">
                <li>Minimum withdrawal amount is 100 tokens.</li>
                <li>Withdrawals are processed within 24-48 hours.</li>
                <li>For withdrawals above 10,000 tokens, a valid KYC document is required.</li>
                <li>Please double-check your UPI ID or Bank details before submitting.</li>
            </ul>
          </div>

          <WithdrawalForm />
        </div>
        <div className="text-center mt-6">
            <Link href="/wallet/withdrawals" className="text-muted-foreground hover:text-white hover:underline text-sm transition-colors">
                View Withdrawal History
            </Link>
        </div>
      </div>
    </div>
  );
}
