
// apps/web/src/components/rooms/ChatBox.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export const ChatBox = ({ roomId }: { roomId: string }) => {
  const [message, setMessage] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: ['messages', roomId],
    queryFn: async () => {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`/api/rooms/${roomId}/messages`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return res.json();
    },
    refetchInterval: 3000 // Fallback polling if SSE fails
  });

  const sendMessage = useMutation({
    mutationFn: async () => {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`/api/rooms/${roomId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ text: message })
      });
      return res.json();
    },
    onSuccess: () => {
      setMessage('');
      queryClient.invalidateQueries({ queryKey: ['messages', roomId] });
    }
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [data?.messages]);

  return (
    <div className="bg-card rounded-xl border border-border flex flex-col h-96">
      <div className="p-3 border-b border-border font-bold text-white">Room Chat</div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {data?.messages?.map((msg: any) => (
          <div key={msg._id} className="flex gap-2">
            <img src={msg.sender?.avatar || '/default-avatar.png'} className="w-6 h-6 rounded-full mt-1" />
            <div>
              <div className="text-xs text-primary font-medium">{msg.sender?.name}</div>
              <div className="text-sm text-gray-300 bg-muted rounded-lg px-3 py-1 mt-0.5">{msg.text}</div>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <div className="p-3 border-t border-border flex gap-2">
        <input
          value={message}
          onChange={e => setMessage(e.target.value)}
          onKeyPress={e => e.key === 'Enter' && sendMessage.mutate()}
          placeholder="Type a message..."
          className="flex-1 bg-muted border border-border rounded-lg px-3 py-2 text-white text-sm"
        />
        <button 
          onClick={() => sendMessage.mutate()}
          className="bg-primary text-primary-foreground text-white px-4 py-2 rounded-lg text-sm font-bold"
        >
          Send
        </button>
      </div>
    </div>
  );
};