
// apps/web/src/components/events/EventDetailClient.tsx
'use client';

import { useAuth } from '@/context/AuthContext';
import { useSSE } from '@/hooks/useSSE';
import { ShareButtons } from './ShareButtons';
import { ScreenshotVerifier } from '../rooms/ScreenshotVerifier';

export const EventDetailClient = ({ initialData, eventId }: any) => {
  const { user } = useAuth();
  useSSE();

  if (!initialData?.event) return <div>Event not found</div>;

  const event = initialData.event;
  const isCreator = user?.id === event.createdBy?._id;
  const hasJoined = event.currentParticipants?.includes(user?.id);

  return (
    <div className="min-h-screen bg-background text-white p-8">
      <div className="max-w-6xl mx-auto">
        {/* Breadcrumb JSON-LD */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SportsEvent",
            "name": event.title,
            "description": event.description,
            "startDate": event.scheduledAt,
            "location": event.location?.address ? {
              "@type": "Place",
              "name": event.location.address
            } : undefined,
            "organizer": {
              "@type": "Person",
              "name": event.createdBy?.name
            }
          })
        }} />

        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">{event.title}</h1>
            <p className="text-muted-foreground">{event.game.toUpperCase()} • {event.gameMode} • {event.eventType}</p>
          </div>
          <ShareButtons eventId={event.shareableLink || eventId} title={event.title} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-card rounded-xl p-6 border border-border">
              <h3 className="text-xl font-bold mb-4">About</h3>
              <p className="text-gray-300 whitespace-pre-line">{event.description}</p>
            </div>

            <div className="bg-card rounded-xl p-6 border border-border">
              <h3 className="text-xl font-bold mb-4">Prize Pool</h3>
              <div className="text-3xl font-bold text-primary mb-4">₹{event.prizePool.total}</div>
              <div className="space-y-2">
                {event.prizePool.breakdown.map((prize: any) => (
                  <div key={prize.position} className="flex justify-between p-3 bg-muted rounded">
                    <span>#{prize.position}</span>
                    <span className="font-bold">₹{prize.amount}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Room / Screenshot section if joined */}
            {hasJoined && (
              <ScreenshotVerifier roomId={event._id} />
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-card rounded-xl p-6 border border-border sticky top-6">
              <div className="flex justify-between mb-4">
                <span className="text-muted-foreground">Entry Fee</span>
                <span className="text-xl font-bold">₹{event.entryFee}</span>
              </div>
              <div className="flex justify-between mb-4">
                <span className="text-muted-foreground">Players</span>
                <span className="font-bold">{event.currentParticipants?.length || 0}/{event.maxParticipants}</span>
              </div>
              <div className="flex justify-between mb-6">
                <span className="text-muted-foreground">Starts</span>
                <span>{new Date(event.scheduledAt).toLocaleString()}</span>
              </div>

              {!user ? (
                <button className="w-full bg-muted text-gray-300 py-3 rounded-lg">Login to Join</button>
              ) : hasJoined ? (
                <button className="w-full bg-green-600 text-white py-3 rounded-lg" disabled>Joined</button>
              ) : (
                <button
                  onClick={async () => {
                    const token = localStorage.getItem('accessToken');
                    await fetch(`/api/events/${eventId}/join`, {
                      method: 'POST',
                      headers: { Authorization: `Bearer ${token}` }
                    });
                    window.location.reload();
                  }}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 text-white font-bold py-3 rounded-lg"
                >
                  Join Event
                </button>
              )}

              {isCreator && event.status === 'upcoming' && (
                <button
                  onClick={async () => {
                    if (!confirm('Cancel event? All participants will be refunded.')) return;
                    const token = localStorage.getItem('accessToken');
                    await fetch(`/api/events/${eventId}/cancel`, {
                      method: 'POST',
                      headers: { Authorization: `Bearer ${token}` }
                    });
                    window.location.reload();
                  }}
                  className="w-full mt-2 bg-red-600/20 text-red-400 hover:bg-red-600/30 py-2 rounded-lg text-sm"
                >
                  Cancel Event
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};