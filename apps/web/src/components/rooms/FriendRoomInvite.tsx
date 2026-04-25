
// apps/web/src/components/rooms/FriendRoomInvite.tsx
'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

export const FriendRoomInvite = ({ roomId }: { roomId: string }) => {
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);

  const { data: friends } = useQuery({
    queryKey: ['friends'],
    queryFn: async () => {
      const token = localStorage.getItem('accessToken');
      const res = await fetch('/api/users/friends', {
        headers: { Authorization: `Bearer ${token}` }
      });
      return res.json();
    }
  });

  const invite = useMutation({
    mutationFn: async () => {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`/api/rooms/${roomId}/invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ friendIds: selectedFriends })
      });
      return res.json();
    },
    onSuccess: () => {
      toast.success('Invitations sent!');
      setSelectedFriends([]);
    }
  });

  const toggleFriend = (id: string) => {
    setSelectedFriends(prev => 
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    );
  };

  return (
    <div className="bg-muted rounded-lg p-4 mt-4">
      <h4 className="font-bold text-white mb-3">Invite Friends</h4>
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {friends?.friends?.map((friend: any) => (
          <div 
            key={friend._id}
            onClick={() => toggleFriend(friend._id)}
            className={`flex items-center gap-3 p-2 rounded cursor-pointer ${
              selectedFriends.includes(friend._id) ? 'bg-primary text-primary-foreground/20 border border-primary' : 'bg-muted/50'
            }`}
          >
            <img src={friend.avatar || '/default-avatar.png'} className="w-8 h-8 rounded-full" />
            <span className="text-sm text-white">{friend.name}</span>
            {selectedFriends.includes(friend._id) && <span className="ml-auto text-primary">✓</span>}
          </div>
        ))}
      </div>
      {selectedFriends.length > 0 && (
        <button
          onClick={() => invite.mutate()}
          className="w-full mt-3 bg-primary text-primary-foreground text-white py-2 rounded text-sm font-bold"
        >
          Send {selectedFriends.length} Invites
        </button>
      )}
    </div>
  );
};