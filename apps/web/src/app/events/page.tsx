import Link from 'next/link';
import { Suspense } from 'react';
import { EventFilters } from '@/components/events/EventFilters';

async function getEvents() {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/events`, {
            cache: 'no-store'
        });
        return res.json();
    } catch (error) {
        return { events: [] };
    }
}

export default async function EventsPage() {
    const data = await getEvents();
    const events = data.events || [];

    return (
        <div className="min-h-screen bg-background text-white py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white">Tournaments</h1>
                        <p className="text-muted-foreground mt-1">Find and join competitive gaming events</p>
                    </div>
                    <Link
                        href="/events/create"
                        className="bg-primary text-primary-foreground hover:bg-primary/90 text-white font-bold py-2 px-6 rounded-lg transition-colors"
                    >
                        Create Event
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Filters Sidebar */}
                    <div className="lg:col-span-1">
                        <Suspense fallback={<div>Loading filters...</div>}>
                            <EventFilters />
                        </Suspense>
                    </div>

                    {/* Events Grid */}
                    <div className="lg:col-span-3">
                        {events.length === 0 ? (
                            <div className="text-center py-20 bg-card rounded-xl border border-border">
                                <div className="text-4xl mb-4">🎮</div>
                                <h3 className="text-xl font-bold text-white mb-2">No events found</h3>
                                <p className="text-muted-foreground">Be the first to create a tournament!</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {events.map((event: any) => (
                                    <Link
                                        key={event._id}
                                        href={`/events/${event._id}`}
                                        className="bg-card rounded-xl border border-border p-6 hover:border-primary/50 transition-colors group"
                                    >
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 bg-primary text-primary-foreground/20 rounded-lg flex items-center justify-center text-2xl">
                                                    {event.game === 'bgmi' ? '🔫' : event.game === 'free_fire_max' ? '🔥' : '🎮'}
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-white group-hover:text-primary transition-colors">
                                                        {event.title}
                                                    </h3>
                                                    <p className="text-sm text-muted-foreground">{event.gameMode}</p>
                                                </div>
                                            </div>
                                            <span className="bg-primary text-primary-foreground/20 text-primary text-xs font-bold px-2 py-1 rounded">
                                                {event.eventType}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-3 gap-4 text-sm mb-4">
                                            <div>
                                                <div className="text-muted-foreground">Entry</div>
                                                <div className="font-bold text-white">₹{event.entryFee}</div>
                                            </div>
                                            <div>
                                                <div className="text-muted-foreground">Prize</div>
                                                <div className="font-bold text-green-400">₹{event.prizePool?.total || 0}</div>
                                            </div>
                                            <div>
                                                <div className="text-muted-foreground">Players</div>
                                                <div className="font-bold text-white">{event.currentParticipants?.length || 0}/{event.maxParticipants}</div>
                                            </div>
                                        </div>

                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-muted-foreground">
                                                {new Date(event.scheduledAt).toLocaleDateString()}
                                            </span>
                                            <span className="text-primary font-medium group-hover:translate-x-1 transition-transform">
                                                View Details →
                                            </span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}