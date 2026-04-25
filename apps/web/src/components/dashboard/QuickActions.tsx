
'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export function QuickActions() {
    const { user } = useAuth();

    const actions = [
        { label: 'Create Event', href: '/events/create', icon: '➕', show: user?.userType === 'partner' || user?.userType === 'admin' },
        { label: 'Quick Room', href: '/room/create', icon: '🚪', show: true },
        { label: 'My Friends', href: '/friends', icon: '👥', show: true },
        { label: 'Withdraw', href: '/wallet/withdraw', icon: '💸', show: true },
    ];

    return (
        <div className="bg-card rounded-xl border border-border p-6 mt-6">
            <h3 className="text-lg font-bold text-white mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
                {actions.filter(a => a.show).map((action) => (
                    <Link
                        key={action.label}
                        href={action.href}
                        className="flex flex-col items-center justify-center p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors border border-border/50"
                    >
                        <span className="text-2xl mb-2">{action.icon}</span>
                        <span className="text-sm font-medium text-gray-300">{action.label}</span>
                    </Link>
                ))}
            </div>
        </div>
    );
}