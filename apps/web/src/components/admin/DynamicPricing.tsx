
// apps/web/src/components/admin/DynamicPricing.tsx
'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export const DynamicPricing = () => {
  const [form, setForm] = useState({
    name: '', planId: '', price: 0, duration: 'monthly', features: [''], targetRole: 'partner', adsEnabled: true
  });

  const queryClient = useQueryClient();
  const { data: plans } = useQuery({
    queryKey: ['pricing-plans'],
    queryFn: async () => {
      const token = localStorage.getItem('accessToken');
      const res = await fetch('/api/subscriptions/plans', {
        headers: { Authorization: `Bearer ${token}` }
      });
      return res.json();
    }
  });

  const createPlan = useMutation({
    mutationFn: async () => {
      const token = localStorage.getItem('accessToken');
      const res = await fetch('/api/admin/pricing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form)
      });
      return res.json();
    },
    onSuccess: () => {
      toast.success('Plan created!');
      queryClient.invalidateQueries({ queryKey: ['pricing-plans'] });
    }
  });

  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <h3 className="text-lg font-bold text-white mb-4">Pricing Plans</h3>
      
      <div className="space-y-3 mb-6">
        <input placeholder="Plan Name" className="w-full bg-muted border border-border rounded px-3 py-2 text-white"
               value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
        <input placeholder="Plan ID (e.g. partner_pro)" className="w-full bg-muted border border-border rounded px-3 py-2 text-white"
               value={form.planId} onChange={e => setForm({...form, planId: e.target.value})} />
        <input type="number" placeholder="Price" className="w-full bg-muted border border-border rounded px-3 py-2 text-white"
               value={form.price} onChange={e => setForm({...form, price: Number(e.target.value)})} />
        <button onClick={() => createPlan.mutate()} className="w-full bg-primary text-primary-foreground text-white py-2 rounded">Create Plan</button>
      </div>

      <div className="space-y-2">
        {plans?.plans?.map((plan: any) => (
          <div key={plan._id} className="flex justify-between items-center p-3 bg-muted rounded">
            <div>
              <div className="text-white font-medium">{plan.name}</div>
              <div className="text-sm text-muted-foreground">₹{plan.price} • {plan.targetRole}</div>
            </div>
            <button className="text-red-400 text-sm">Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
};