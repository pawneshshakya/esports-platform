'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { TransactionList } from '@/components/wallet/TransactionList';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { WalletCard } from '@/components/dashboard/WalletCard';
import { useSSE } from '@/hooks/useSSE';
import { toast } from 'sonner';

export default function WalletOverviewPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);

  useSSE();

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    fetchWallet();
  }, [user]);

  const fetchWallet = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch('/api/wallet', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        setWallet(data.wallet);
      } else {
        toast.error('Failed to load wallet');
      }
    } catch (error: any) {
      toast.error(error.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="bg-card/50 border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-white">My Wallet</h1>
                <p className="text-muted-foreground text-sm">
                  Manage your tournament earnings and transfers
                </p>
              </div>
              <div className="flex items-center gap-4">
                <Link href="/wallet/transfer" className="bg-primary text-primary-foreground/20 text-primary text-xs font-bold px-3 py-1 rounded-full uppercase hover:bg-primary/30">
                  Transfer
                </Link>
              </div>
            </div>
          </div>
        </div>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {loading ? (
            <div className="min-h-[300px] flex items-center justify-center">
              <div className="text-muted-foreground animate-pulse">Loading wallet...</div>
            </div>
          ) : wallet ? (
            <>
              <div className="mb-8 max-w-2xl">
                <WalletCard compact={false} />
              </div>

              <div className="grid gap-6">
                <div className="bg-card rounded-xl border border-border p-6">
                  <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Link href="/wallet/transfer" className="bg-primary/10 hover:bg-primary/20 border border-primary/20 rounded-lg p-4 text-center transition-all group">
                      <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">💸</div>
                      <h3 className="font-semibold text-white mb-2">Transfer Tokens</h3>
                      <p className="text-sm text-muted-foreground">Send tokens to other users</p>
                    </Link>
                    <Link href="/wallet/transactions" className="bg-muted/10 hover:bg-muted/20 border border-muted/20 rounded-lg p-4 text-center transition-all group">
                      <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">📜</div>
                      <h3 className="font-semibold text-white mb-2">Transaction History</h3>
                      <p className="text-sm text-muted-foreground">View all your transactions</p>
                    </Link>
                    <Link href="/wallet/withdraw" className="bg-primary/10 hover:bg-primary/20 border border-primary/20 rounded-lg p-4 text-center transition-all group">
                      <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">🏧</div>
                      <h3 className="font-semibold text-white mb-2">Request Withdrawal</h3>
                      <p className="text-sm text-muted-foreground">Withdraw tokens to bank/UPI</p>
                    </Link>
                  </div>
                </div>

                <div className="bg-card rounded-xl border border-border p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-white">Recent Activity</h2>
                    <Link href="/wallet/transactions" className="text-primary text-sm hover:underline">
                      View All
                    </Link>
                  </div>
                  <TransactionList limit={5} />
                </div>
              </>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Unable to load wallet data</p>
              <button onClick={() => window.location.reload()} className="bg-primary text-primary-foreground hover:bg-primary/90 text-white text-sm font-bold py-2 px-4 rounded-lg transition-colors">
                Retry
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}