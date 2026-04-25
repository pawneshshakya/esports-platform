
'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';

export function NotificationBell() {
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
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-gray-300 hover:text-white transition-colors"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                        {unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-card border border-border rounded-xl shadow-2xl z-50 max-h-96 overflow-y-auto">
                    <div className="p-3 border-b border-border font-bold text-white flex justify-between items-center">
                        <span>Notifications</span>
                        {unreadCount > 0 && (
                            <span className="text-xs bg-primary text-primary-foreground text-white px-2 py-0.5 rounded-full">{unreadCount} new</span>
                        )}
                    </div>

                    {data?.notifications?.length === 0 ? (
                        <div className="p-4 text-center text-muted-foreground text-sm">No notifications</div>
                    ) : (
                        <div className="divide-y divide-gray-800">
                            {data?.notifications?.slice(0, 10).map((notif: any) => (
                                <div
                                    key={notif._id}
                                    onClick={() => !notif.isRead && markRead.mutate(notif._id)}
                                    className={`p-3 cursor-pointer hover:bg-muted/50 transition-colors ${!notif.isRead ? 'bg-muted/30 border-l-2 border-primary' : ''}`}
                                >
                                    <div className="text-sm font-medium text-white">{notif.title}</div>
                                    <div className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{notif.message}</div>
                                    <div className="text-xs text-gray-600 mt-1">
                                        {new Date(notif.createdAt).toLocaleTimeString()}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="p-2 border-t border-border text-center">
                        <Link href="/notifications" className="text-xs text-primary hover:text-purple-300">
                            View All Notifications
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}