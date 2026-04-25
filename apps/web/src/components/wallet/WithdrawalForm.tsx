'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export function WithdrawalForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    amount: '',
    method: 'upi',
    upiId: '',
    bankDetails: ''
  });
  const [kycFile, setKycFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number(form.amount);

    if (amount < 100) {
      toast.error('Minimum withdrawal amount is 100 tokens');
      return;
    }

    if (amount > 10000 && !kycFile) {
      toast.error('KYC document is required for withdrawals over 10,000 tokens');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('accessToken');
      const formData = new FormData();
      formData.append('amount', form.amount);
      formData.append('method', form.method);
      
      if (form.method === 'upi') {
        formData.append('upiId', form.upiId);
      } else {
        formData.append('bankDetails', form.bankDetails);
      }

      if (kycFile) {
        formData.append('kyc', kycFile);
      }

      const res = await fetch('/api/wallet/withdraw', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      const data = await res.json();

      if (res.ok) {
        toast.success('Withdrawal requested successfully');
        router.push('/wallet/withdrawals');
      } else {
        toast.error(data.error || 'Withdrawal failed');
      }
    } catch (error: any) {
      toast.error(error.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-muted-foreground mb-2">
          Amount (Tokens)
        </label>
        <input
          type="number"
          value={form.amount}
          onChange={(e) => setForm({ ...form, amount: e.target.value })}
          placeholder="Enter amount"
          className="w-full bg-muted border border-border rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-primary"
          min={100}
          required
        />
        <p className="text-xs text-muted-foreground mt-1">Minimum withdrawal is 100 tokens</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-muted-foreground mb-2">
          Withdrawal Method
        </label>
        <div className="grid grid-cols-2 gap-4">
          <label className={`cursor-pointer border rounded-lg p-4 text-center transition-all ${form.method === 'upi' ? 'bg-primary/20 border-primary text-white' : 'bg-muted border-border text-muted-foreground'}`}>
            <input type="radio" name="method" value="upi" checked={form.method === 'upi'} onChange={() => setForm({ ...form, method: 'upi' })} className="sr-only" />
            <div className="text-2xl mb-1">📱</div>
            <div className="font-semibold">UPI</div>
          </label>
          <label className={`cursor-pointer border rounded-lg p-4 text-center transition-all ${form.method === 'bank' ? 'bg-primary/20 border-primary text-white' : 'bg-muted border-border text-muted-foreground'}`}>
            <input type="radio" name="method" value="bank" checked={form.method === 'bank'} onChange={() => setForm({ ...form, method: 'bank' })} className="sr-only" />
            <div className="text-2xl mb-1">🏦</div>
            <div className="font-semibold">Bank Transfer</div>
          </label>
        </div>
      </div>

      {form.method === 'upi' ? (
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">
            UPI ID
          </label>
          <input
            type="text"
            value={form.upiId}
            onChange={(e) => setForm({ ...form, upiId: e.target.value })}
            placeholder="e.g. user@upi"
            className="w-full bg-muted border border-border rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-primary"
            required={form.method === 'upi'}
          />
        </div>
      ) : (
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">
            Bank Details
          </label>
          <textarea
            value={form.bankDetails}
            onChange={(e) => setForm({ ...form, bankDetails: e.target.value })}
            placeholder="Account Number, IFSC Code, Account Holder Name"
            className="w-full bg-muted border border-border rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-primary min-h-[100px]"
            required={form.method === 'bank'}
          />
        </div>
      )}

      {Number(form.amount) > 10000 && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
          <label className="block text-sm font-medium text-yellow-500 mb-2">
            KYC Document Required (> 10,000 tokens)
          </label>
          <input
            type="file"
            accept="image/*,.pdf"
            onChange={(e) => setKycFile(e.target.files?.[0] || null)}
            className="w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/90"
            required
          />
          <p className="text-xs text-yellow-500/70 mt-2">
            Please upload a valid ID proof (Aadhar/PAN).
          </p>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 rounded-lg transition-all disabled:opacity-50"
      >
        {loading ? 'Processing...' : 'Request Withdrawal'}
      </button>
    </form>
  );
}
