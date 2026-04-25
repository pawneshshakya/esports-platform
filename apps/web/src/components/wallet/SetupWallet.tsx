'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export const SetupWallet = () => {
  const [profilePassword, setProfilePassword] = useState('');
  const [confirmProfilePassword, setConfirmProfilePassword] = useState('');
  const [transactionPin, setTransactionPin] = useState('');
  const [confirmTransactionPin, setConfirmTransactionPin] = useState('');
  const queryClient = useQueryClient();

  const setupMutation = useMutation({
    mutationFn: async () => {
      const token = localStorage.getItem('accessToken');
      const res = await fetch('/api/wallet/setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          profilePassword,
          transactionPin
        })
      });
      return res.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        toast.success('Wallet security set up successfully!');
        queryClient.invalidateQueries({ queryKey: ['wallet'] });
        // Reset form
        setProfilePassword('');
        setConfirmProfilePassword('');
        setTransactionPin('');
        setConfirmTransactionPin('');
      } else {
        toast.error(data.error || 'Setup failed');
      }
    }
  });

  return (
    <div className="bg-card p-6 rounded-2xl border border-border">
      <h3 className="text-xl font-bold text-white mb-4">Setup Wallet Security</h3>
      <p className="text-muted-foreground mb-6">
        Secure your wallet with a profile password and transaction PIN for transfers.
      </p>

      <form onSubmit={(e) => {
        e.preventDefault();
        if (profilePassword !== confirmProfilePassword) {
          toast.error('Profile passwords do not match');
          return;
        }
        if (transactionPin !== confirmTransactionPin) {
          toast.error('Transaction PINs do not match');
          return;
        }
        if (profilePassword.length < 6) {
          toast.error('Profile password must be at least 6 characters');
          return;
        }
        if (transactionPin.length !== 4 || !/^\d+$/.test(transactionPin)) {
          toast.error('Transaction PIN must be exactly 4 digits');
          return;
        }
        setupMutation.mutate();
      }} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-1">
            Profile Password
          </label>
          <input
            type="password"
            value={profilePassword}
            onChange={(e) => setProfilePassword(e.target.value)}
            placeholder="Enter profile password"
            className="w-full bg-muted border border-border rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-ring"
            minLength={6}
          />
          <p className="text-xs text-muted-foreground mt-1">
            Must be at least 6 characters
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-1">
            Confirm Profile Password
          </label>
          <input
            type="password"
            value={confirmProfilePassword}
            onChange={(e) => setConfirmProfilePassword(e.target.value)}
            placeholder="Confirm profile password"
            className="w-full bg-muted border border-border rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-ring"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              Transaction PIN
            </label>
            <input
              type="password"
              value={transactionPin}
              onChange={(e) => setTransactionPin(e.target.value)}
              placeholder="Enter 4-digit PIN"
              className="w-full bg-muted border border-border rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-ring"
              maxLength={4}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Must be exactly 4 digits
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              Confirm Transaction PIN
            </label>
            <input
              type="password"
              value={confirmTransactionPin}
              onChange={(e) => setConfirmTransactionPin(e.target.value)}
              placeholder="Confirm 4-digit PIN"
              className="w-full bg-muted border border-border rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-ring"
              maxLength={4}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={setupMutation.isPending}
          className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-3 rounded-lg transition-all disabled:opacity-50"
        >
          {setupMutation.isPending ? 'Setting up...' : 'Setup Wallet Security'}
        </button>
      </form>
    </div>
  );
};