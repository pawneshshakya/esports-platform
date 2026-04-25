
// apps/web/src/components/notifications/NotificationPanel.tsx
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

export const NotificationPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const token = localStorage.getItem('accessToken');
      const res = await fetch('/api/notifications', {
        headers: { Authorization: `Bearer ${token}` }
      });
      return res.json();
    }
  });

  const markRead = useMutation({
    mutationFn: async (id: string) => {
      const token = localStorage.getItem('accessToken');
      await fetch(`/api/notifications/${id}/read`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] })
  });

  const unreadCount = data?.notifications?.filter((n: any) => !n.isRead).length || 0;

  return (
    <div className="relative">
      <button onClick={() => setIsOpen(!isOpen)} className="relative p-2">
        🔔
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-card border border-border rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto">
          <div className="p-3 border-b border-border font-bold">Notifications</div>
          {data?.notifications?.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground text-sm">No notifications</div>
          ) : (
            data?.notifications?.map((notif: any) => (
              <div 
                key={notif._id}
                onClick={() => !notif.isRead && markRead.mutate(notif._id)}
                className={`p-3 border-b border-border cursor-pointer hover:bg-muted ${!notif.isRead ? 'bg-muted/50' : ''}`}
              >
                <div className="text-sm font-medium text-white">{notif.title}</div>
                <div className="text-xs text-muted-foreground mt-1">{notif.message}</div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};