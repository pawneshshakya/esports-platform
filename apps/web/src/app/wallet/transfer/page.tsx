'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { TransferForm } from '@/components/wallet/TransferForm';
import { toast } from 'sonner';

export default function WalletTransferPage() {
  const { user } = useAuth();
  const router = useRouter();

  if (!user) {
    router.push('/login');
    return null;
  }

  const handleTransferSuccess = () => {
    // Refresh wallet data after successful transfer
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-xl mx-auto px-4 py-12">
        <div className="bg-card rounded-xl border border-border p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-white">Transfer Tokens</h1>
            <a href="/wallet" className="text-sm text-muted-foreground hover:text-white">
              ← Back to Wallet
            </a>
          </div>

          <div className="bg-muted/50 p-4 rounded-lg mb-6">
            <div className="text-sm text-muted-foreground">Available Balance</div>
            <div className="text-2xl font-bold text-white">
              {user.wallet?.balance || 0} tokens
            </div>
          </div>

          <TransferForm
            onSuccess={handleTransferSuccess}
          />
        </div>
      </div>
    </div>
  );
}