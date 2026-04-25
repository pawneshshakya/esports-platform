'use client';

import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

interface Props {
    compact?: boolean;
}

export function WalletCard({ compact }: Props) {
    const { user } = useAuth();

    if (!user) return null;

    if (compact) {
        return (
            <div className="bg-muted/50 border border-border rounded-lg px-4 py-2 flex items-center gap-3">
                <div className="text-2xl">💰</div>
                <div>
                    <div className="text-xs text-muted-foreground">Balance</div>
                    <div className="font-bold text-primary">{user.wallet?.balance || 0} tokens</div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-card rounded-xl border border-border p-6 shadow-lg relative overflow-hidden">
            {/* Background design elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl -ml-10 -mb-10"></div>

            <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h3 className="text-lg font-bold text-white">My Wallet</h3>
                        <p className="text-xs text-muted-foreground mt-1">ID: <span className="font-mono text-gray-300">{user.wallet?.accountNumber || 'N/A'}</span></p>
                    </div>
                    <div className="text-2xl">💳</div>
                </div>

                <div className="bg-gradient-to-r from-primary/80 to-primary/40 rounded-xl p-5 mb-6 border border-primary/30 shadow-inner backdrop-blur-sm">
                    <div className="text-sm text-primary-foreground/80 font-medium mb-1">Available Balance</div>
                    <div className="flex items-baseline gap-2">
                        <div className="text-4xl font-black text-white">{user.wallet?.balance || 0}</div>
                        <div className="text-sm font-semibold text-primary-foreground/90">tokens</div>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                    <Link
                        href="/wallet/transfer"
                        className="flex flex-col items-center justify-center bg-muted/40 hover:bg-muted/80 border border-border/50 rounded-xl py-3 transition-colors group"
                    >
                        <div className="text-xl mb-1 group-hover:scale-110 transition-transform">💸</div>
                        <span className="text-xs font-semibold text-white">Transfer</span>
                    </Link>
                    <Link
                        href="/wallet/transactions"
                        className="flex flex-col items-center justify-center bg-muted/40 hover:bg-muted/80 border border-border/50 rounded-xl py-3 transition-colors group"
                    >
                        <div className="text-xl mb-1 group-hover:scale-110 transition-transform">📜</div>
                        <span className="text-xs font-semibold text-white">History</span>
                    </Link>
                    <Link
                        href="/wallet/withdraw"
                        className="flex flex-col items-center justify-center bg-muted/40 hover:bg-muted/80 border border-border/50 rounded-xl py-3 transition-colors group"
                    >
                        <div className="text-xl mb-1 group-hover:scale-110 transition-transform">🏧</div>
                        <span className="text-xs font-semibold text-white">Withdraw</span>
                    </Link>
                </div>
            </div>
        </div>
    );
}