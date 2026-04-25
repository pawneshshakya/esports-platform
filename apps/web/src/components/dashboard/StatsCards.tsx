
'use client';

import { useAuth } from '@/context/AuthContext';

export function StatsCards() {
    const { user } = useAuth();

    const stats = [
        { label: 'Total Matches', value: user?.profile?.stats?.totalMatches || 0, icon: '🎮' },
        { label: 'Wins', value: user?.profile?.stats?.wins || 0, icon: '🏆' },
        { label: 'Win Rate', value: `${user?.profile?.stats?.winRate || 0}%`, icon: '📈' },
        { label: 'Earnings', value: user?.profile?.stats?.earnings || 0, icon: '💰' },
    ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat) => (
                <div key={stat.label} className="bg-card rounded-xl border border-border p-4">
                    <div className="text-2xl mb-2">{stat.icon}</div>
                    <div className="text-2xl font-bold text-white">{stat.value}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
            ))}
        </div>
    );
}