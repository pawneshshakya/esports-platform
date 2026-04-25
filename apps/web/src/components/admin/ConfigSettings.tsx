
// apps/web/src/components/admin/ConfigSettings.tsx
'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export const ConfigSettings = () => {
  const queryClient = useQueryClient();
  
  const { data: config } = useQuery({
    queryKey: ['config'],
    queryFn: async () => {
      const token = localStorage.getItem('accessToken');
      const res = await fetch('/api/config', { headers: { Authorization: `Bearer ${token}` } });
      return res.json();
    }
  });

  const [values, setValues] = useState({
    userLimit: config?.approvalLimits?.user || 500,
    partnerLimit: config?.approvalLimits?.partner || 2000,
    commission: config?.commissionRate || 5
  });

  const update = useMutation({
    mutationFn: async () => {
      const token = localStorage.getItem('accessToken');
      const res = await fetch('/api/admin/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          approvalLimits: { user: values.userLimit, partner: values.partnerLimit },
          commissionRate: values.commission
        })
      });
      return res.json();
    },
    onSuccess: () => {
      toast.success('Settings updated!');
      queryClient.invalidateQueries({ queryKey: ['config'] });
    }
  });

  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <h3 className="text-lg font-bold text-white mb-4">Dynamic Limits & Config</h3>
      
      <div className="space-y-4">
        <div>
          <label className="text-sm text-muted-foreground">User Auto-Approve Limit (₹)</label>
          <input 
            type="number"
            className="w-full bg-muted border border-border rounded px-3 py-2 text-white"
            value={values.userLimit}
            onChange={e => setValues({...values, userLimit: Number(e.target.value)})}
          />
        </div>

        <div>
          <label className="text-sm text-muted-foreground">Partner Auto-Approve Limit (₹)</label>
          <input 
            type="number"
            className="w-full bg-muted border border-border rounded px-3 py-2 text-white"
            value={values.partnerLimit}
            onChange={e => setValues({...values, partnerLimit: Number(e.target.value)})}
          />
        </div>

        <div>
          <label className="text-sm text-muted-foreground">Platform Commission (%)</label>
          <input 
            type="number"
            className="w-full bg-muted border border-border rounded px-3 py-2 text-white"
            value={values.commission}
            onChange={e => setValues({...values, commission: Number(e.target.value)})}
          />
        </div>

        <button 
          onClick={() => update.mutate()}
          className="w-full bg-primary text-primary-foreground text-white py-2 rounded font-bold"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
};