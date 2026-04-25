'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { SetupWallet } from '@/components/wallet/SetupWallet';
import Link from 'next/link';

export default function WalletSetupPage() {
  const { user } = useAuth();
  const router = useRouter();

  if (!user) {
    router.push('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="mb-6 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-white">Wallet Configuration</h1>
            <Link href="/wallet" className="text-sm text-muted-foreground hover:text-white">
                ← Back to Wallet
            </Link>
        </div>
        
        <SetupWallet />

        <div className="mt-8 text-center text-muted-foreground">
          <p>
            Already have wallet security? <Link href="/wallet" className="text-primary font-medium hover:underline">
              Go to Wallet
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}