
// apps/web/src/components/wallet/TransferForm.tsx
'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export const TransferForm = () => {
  const [receiverAccount, setReceiverAccount] = useState('');
  const [amount, setAmount] = useState('');
  const [profilePassword, setProfilePassword] = useState('');
  const [transactionPin, setTransactionPin] = useState('');
  const [note, setNote] = useState('');
  const queryClient = useQueryClient();

  const transferMutation = useMutation({
    mutationFn: async () => {
      const token = localStorage.getItem('accessToken');
      const res = await fetch('/api/wallet/transfer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          receiverAccountNumber: receiverAccount,
          amount: Number(amount),
          profilePassword,
          transactionPin,
          note
        })
      });
      return res.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        toast.success('Transfer Successful!');
        queryClient.invalidateQueries({ queryKey: ['wallet'] });
        setReceiverAccount('');
        setAmount('');
        setProfilePassword('');
        setTransactionPin('');
      } else {
        toast.error(data.error || 'Transfer failed');
      }
    }
  });

  return (
    <div className="bg-card p-6 rounded-2xl border border-border">
      <h3 className="text-xl font-bold text-white mb-4">Transfer Tokens</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-1">Receiver Wallet ID</label>
          <input
            type="text"
            value={receiverAccount}
            onChange={e => setReceiverAccount(e.target.value)}
            placeholder="ESXXXXXXXX"
            className="w-full bg-muted border border-border rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-ring"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-1">Amount</label>
          <input
            type="number"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            min="1"
            className="w-full bg-muted border border-border rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-ring"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">Profile Password</label>
            <input
              type="password"
              value={profilePassword}
              onChange={e => setProfilePassword(e.target.value)}
              className="w-full bg-muted border border-border rounded-lg px-4 py-2 text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">Transaction PIN</label>
            <input
              type="password"
              maxLength={4}
              value={transactionPin}
              onChange={e => setTransactionPin(e.target.value)}
              className="w-full bg-muted border border-border rounded-lg px-4 py-2 text-white"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-1">Note (Optional)</label>
          <input
            type="text"
            value={note}
            onChange={e => setNote(e.target.value)}
            className="w-full bg-muted border border-border rounded-lg px-4 py-2 text-white"
          />
        </div>

        <button
          onClick={() => transferMutation.mutate()}
          disabled={transferMutation.isPending}
          className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-3 rounded-lg transition-all disabled:opacity-50"
        >
          {transferMutation.isPending ? 'Processing...' : 'Send Tokens'}
        </button>
      </div>
    </div>
  );
};