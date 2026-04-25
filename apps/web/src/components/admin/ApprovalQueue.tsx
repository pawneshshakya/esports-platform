
// apps/web/src/components/admin/ApprovalQueue.tsx
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export const ApprovalQueue = () => {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['pending-approvals'],
    queryFn: async () => {
      const token = localStorage.getItem('accessToken');
      const res = await fetch('/api/admin/pending-approvals', {
        headers: { Authorization: `Bearer ${token}` }
      });
      return res.json();
    }
  });

  const handleAction = async (type: string, id: string, action: string, notes?: string) => {
    const token = localStorage.getItem('accessToken');
    let endpoint = '';
    
    if (type === 'event') endpoint = `/api/events/${id}/approve`;
    else if (type === 'blog') endpoint = `/api/blogs/${id}/review`;
    else if (type === 'withdrawal') endpoint = `/api/admin/withdrawals/${id}`;

    const res = await fetch(endpoint, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status: action, notes })
    });

    if (res.ok) {
      toast.success(`${type} ${action}!`);
      queryClient.invalidateQueries({ queryKey: ['pending-approvals'] });
    }
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      {/* Events Approval */}
      <div className="bg-card rounded-xl border border-border p-6">
        <h3 className="text-lg font-bold text-white mb-4">Pending Events ({data?.events?.length || 0})</h3>
        {data?.events?.map((event: any) => (
          <div key={event._id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg mb-2">
            <div>
              <div className="text-white font-medium">{event.title}</div>
              <div className="text-sm text-muted-foreground">By: {event.createdBy?.name} | Fee: ₹{event.entryFee}</div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => handleAction('event', event._id, 'approved')} className="px-3 py-1 bg-green-600 text-white rounded text-sm">Approve</button>
              <button onClick={() => handleAction('event', event._id, 'rejected')} className="px-3 py-1 bg-red-600 text-white rounded text-sm">Reject</button>
            </div>
          </div>
        ))}
      </div>

      {/* Blogs Approval */}
      <div className="bg-card rounded-xl border border-border p-6">
        <h3 className="text-lg font-bold text-white mb-4">Pending Blogs ({data?.blogs?.length || 0})</h3>
        {data?.blogs?.map((blog: any) => (
          <div key={blog._id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg mb-2">
            <div>
              <div className="text-white font-medium">{blog.title}</div>
              <div className="text-sm text-muted-foreground">By: {blog.author?.name}</div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => handleAction('blog', blog._id, 'published')} className="px-3 py-1 bg-green-600 text-white rounded text-sm">Publish</button>
              <button onClick={() => handleAction('blog', blog._id, 'rejected')} className="px-3 py-1 bg-red-600 text-white rounded text-sm">Reject</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};