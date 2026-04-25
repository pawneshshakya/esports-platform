
// apps/web/src/components/rooms/DirectRoomCreator.tsx
'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export const DirectRoomCreator = () => {
  const router = useRouter();
  const [form, setForm] = useState({
    game: 'bgmi',
    gameMode: 'squad',
    maxPlayers: 4,
    map: 'Erangel',
    password: ''
  });

  const createRoom = useMutation({
    mutationFn: async () => {
      const token = localStorage.getItem('accessToken');
      const res = await fetch('/api/rooms/create-direct', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form)
      });
      return res.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        toast.success('Room created!');
        router.push(`/room/${data.room.id}`);
      }
    }
  });

  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <h3 className="text-xl font-bold text-white mb-4">Quick Play with Friends</h3>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-muted-foreground">Game</label>
            <select 
              className="w-full bg-muted border border-border rounded px-3 py-2 text-white"
              value={form.game} 
              onChange={e => setForm({...form, game: e.target.value})}
            >
              <option value="bgmi">BGMI</option>
              <option value="free_fire_max">Free Fire Max</option>
            </select>
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Mode</label>
            <select 
              className="w-full bg-muted border border-border rounded px-3 py-2 text-white"
              value={form.gameMode} 
              onChange={e => setForm({...form, gameMode: e.target.value})}
            >
              <option value="solo">Solo</option>
              <option value="duo">Duo</option>
              <option value="squad">Squad</option>
            </select>
          </div>
        </div>

        <div>
          <label className="text-sm text-muted-foreground">Max Players</label>
          <input 
            type="number" min="2" max="100"
            className="w-full bg-muted border border-border rounded px-3 py-2 text-white"
            value={form.maxPlayers}
            onChange={e => setForm({...form, maxPlayers: Number(e.target.value)})}
          />
        </div>

        <div>
          <label className="text-sm text-muted-foreground">Room Password (Optional)</label>
          <input 
            type="password"
            className="w-full bg-muted border border-border rounded px-3 py-2 text-white"
            value={form.password}
            onChange={e => setForm({...form, password: e.target.value})}
            placeholder="Leave empty for public"
          />
        </div>

        <button
          onClick={() => createRoom.mutate()}
          disabled={createRoom.isPending}
          className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold py-3 rounded-lg"
        >
          {createRoom.isPending ? 'Creating...' : 'Create Room'}
        </button>
      </div>
    </div>
  );
};