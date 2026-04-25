
'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';

export function ActiveEvents() {
    const { data, isLoading } = useQuery({
        queryKey: ['events'],
        queryFn: async () => {
            const token = localStorage.getItem('accessToken');
            const res = await fetch('/api/events', {
                headers: { Authorization: `Bearer ${token}` }
            });
            return res.json();
        }
    });

    if (isLoading) {
        return <div className="text-muted-foreground">Loading events...</div>;
    }

    const events = data?.events || [];

    return (
        <div className="bg-card rounded-xl border border-border p-6">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white">Active Tournaments</h3>
                <Link href="/events" className="text-primary text-sm hover:text-purple-300">
                    View All →
                </Link>
            </div>

            {events.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                    No active tournaments found
                </div>
            ) : (
                <div className="space-y-3">
                    {events.slice(0, 5).map((event: any) => (
                        <div key={event._id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-primary text-primary-foreground/20 rounded-lg flex items-center justify-center text-lg">
                                    {event.game === 'bgmi' ? '🔫' : event.game === 'free_fire_max' ? '🔥' : '🎮'}
                                </div>
                                <div>
                                    <div className="font-medium text-white text-sm">{event.title}</div>
                                    <div className="text-xs text-muted-foreground">
                                        {event.gameMode} • {event.currentParticipants?.length || 0}/{event.maxParticipants} players
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-sm font-bold text-primary">₹{event.entryFee}</div>
                                <div className="text-xs text-muted-foreground">Prize: ₹{event.prizePool?.total || 0}</div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}