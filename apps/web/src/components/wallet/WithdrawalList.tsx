'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';

interface Withdrawal {
  _id: string;
  amount: number;
  method: string;
  status: string;
  createdAt: string;
  remarks?: string;
}

export function WithdrawalList() {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  const fetchWithdrawals = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch('/api/wallet/withdrawals', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        setWithdrawals(data.withdrawals);
      } else {
        toast.error('Failed to load withdrawals');
      }
    } catch (error: any) {
      toast.error(error.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-muted-foreground py-8 text-center animate-pulse">Loading withdrawals...</div>;
  }

  if (withdrawals.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground bg-card/30 rounded-xl border border-border/50">
        No withdrawal requests found.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {withdrawals.map((wd) => (
        <div key={wd._id} className="bg-card rounded-xl border border-border p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all hover:border-primary/30">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-blue-500/10 text-blue-500">
              🏦
            </div>
            <div>
              <p className="font-semibold text-white capitalize">{wd.method}</p>
              <p className="text-xs text-muted-foreground">{new Date(wd.createdAt).toLocaleString()}</p>
              {wd.remarks && <p className="text-xs text-muted-foreground/80 mt-1">Note: {wd.remarks}</p>}
            </div>
          </div>
          <div className="flex flex-col items-end">
            <span className="font-bold text-white">
              {wd.amount} tokens
            </span>
            <span className={`text-xs px-2 py-0.5 rounded-full mt-1 ${
              wd.status === 'completed' ? 'bg-green-500/20 text-green-400' :
              wd.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
              'bg-red-500/20 text-red-400'
            }`}>
              {wd.status}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
