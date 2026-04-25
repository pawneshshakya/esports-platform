
// apps/web/src/components/events/CreateEventForm.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export const CreateEventForm = () => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    game: 'bgmi',
    gameMode: 'squad',
    entryFee: 0,
    prizePool: { total: 0, breakdown: [{ position: 1, amount: 0 }] },
    maxParticipants: 4,
    scheduledAt: '',
    registrationDeadline: '',
    eventType: 'local'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (data.success) {
        toast.success(data.event.requiresApproval 
          ? 'Event submitted for approval!' 
          : 'Event created successfully!'
        );
        router.push(`/events/${data.event._id}`);
      } else {
        toast.error(data.error || 'Failed to create event');
      }
    } catch (error) {
      toast.error('Network error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-card p-6 rounded-2xl border border-border">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">Event Title</label>
          <input
            type="text"
            required
            className="w-full bg-muted border border-border rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-ring focus:border-transparent"
            value={formData.title}
            onChange={e => setFormData({...formData, title: e.target.value})}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">Game</label>
          <select
            className="w-full bg-muted border border-border rounded-lg px-4 py-2 text-white"
            value={formData.game}
            onChange={e => setFormData({...formData, game: e.target.value})}
          >
            <option value="bgmi">BGMI</option>
            <option value="free_fire_max">Free Fire Max</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">Entry Fee (Tokens)</label>
          <input
            type="number"
            min="0"
            className="w-full bg-muted border border-border rounded-lg px-4 py-2 text-white"
            value={formData.entryFee}
            onChange={e => setFormData({...formData, entryFee: Number(e.target.value)})}
          />
          <p className="text-xs text-muted-foreground mt-1">
            ₹500+ requires admin approval for users, ₹2000+ for partners
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">Max Participants</label>
          <input
            type="number"
            min="2"
            max="100"
            className="w-full bg-muted border border-border rounded-lg px-4 py-2 text-white"
            value={formData.maxParticipants}
            onChange={e => setFormData({...formData, maxParticipants: Number(e.target.value)})}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">Scheduled Date</label>
          <input
            type="datetime-local"
            required
            className="w-full bg-muted border border-border rounded-lg px-4 py-2 text-white"
            value={formData.scheduledAt}
            onChange={e => setFormData({...formData, scheduledAt: e.target.value})}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">Registration Deadline</label>
          <input
            type="datetime-local"
            required
            className="w-full bg-muted border border-border rounded-lg px-4 py-2 text-white"
            value={formData.registrationDeadline}
            onChange={e => setFormData({...formData, registrationDeadline: e.target.value})}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-muted-foreground mb-2">Description</label>
        <textarea
          rows={3}
          className="w-full bg-muted border border-border rounded-lg px-4 py-2 text-white"
          value={formData.description}
          onChange={e => setFormData({...formData, description: e.target.value})}
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-gradient-to-r from-primary to-primary/60 hover:from-purple-700 hover:to-primary/60 text-white font-bold py-3 px-6 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? 'Creating...' : 'Create Event'}
      </button>
    </form>
  );
};