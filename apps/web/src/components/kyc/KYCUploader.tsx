
// apps/web/src/components/kyc/KYCUploader.tsx
'use client';

import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

export const KYCUploader = () => {
  const [form, setForm] = useState({
    documentType: 'pan' as 'pan' | 'aadhaar',
    documentNumber: '',
    front: null as File | null,
    back: null as File | null,
    selfie: null as File | null
  });

  const { data: kycStatus } = useQuery({
    queryKey: ['kyc'],
    queryFn: async () => {
      const token = localStorage.getItem('accessToken');
      const res = await fetch('/api/kyc/me', { headers: { Authorization: `Bearer ${token}` } });
      return res.json();
    }
  });

  const submit = useMutation({
    mutationFn: async () => {
      const data = new FormData();
      data.append('documentType', form.documentType);
      data.append('documentNumber', form.documentNumber);
      if (form.front) data.append('front', form.front);
      if (form.back) data.append('back', form.back);
      if (form.selfie) data.append('selfie', form.selfie);

      const token = localStorage.getItem('accessToken');
      const res = await fetch('/api/kyc/submit', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: data
      });
      return res.json();
    },
    onSuccess: () => toast.success('KYC Submitted for review!')
  });

  if (kycStatus?.kyc?.status === 'approved') {
    return <div className="text-green-400 font-bold">✓ KYC Verified</div>;
  }

  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <h3 className="text-xl font-bold text-white mb-4">KYC Verification</h3>
      {kycStatus?.kyc?.status === 'pending' && (
        <div className="bg-yellow-500/10 text-yellow-400 p-3 rounded mb-4">⏳ Under Review</div>
      )}
      
      <div className="space-y-4">
        <select 
          className="w-full bg-muted border border-border rounded px-3 py-2 text-white"
          value={form.documentType}
          onChange={e => setForm({...form, documentType: e.target.value as any})}
        >
          <option value="pan">PAN Card</option>
          <option value="aadhaar">Aadhaar</option>
          <option value="passport">Passport</option>
        </select>

        <input
          placeholder="Document Number"
          className="w-full bg-muted border border-border rounded px-3 py-2 text-white"
          value={form.documentNumber}
          onChange={e => setForm({...form, documentNumber: e.target.value})}
        />

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="text-xs text-muted-foreground">Front</label>
            <input type="file" accept="image/*" onChange={e => setForm({...form, front: e.target.files?.[0] || null})} />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Back</label>
            <input type="file" accept="image/*" onChange={e => setForm({...form, back: e.target.files?.[0] || null})} />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Selfie</label>
            <input type="file" accept="image/*" onChange={e => setForm({...form, selfie: e.target.files?.[0] || null})} />
          </div>
        </div>

        <button
          onClick={() => submit.mutate()}
          disabled={submit.isPending}
          className="w-full bg-primary text-primary-foreground text-white py-3 rounded-lg font-bold"
        >
          {submit.isPending ? 'Submitting...' : 'Submit KYC'}
        </button>
      </div>
    </div>
  );
};