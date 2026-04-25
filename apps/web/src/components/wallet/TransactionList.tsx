'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';

interface Transaction {
  _id: string;
  transactionId: string;
  type: string;
  amount: number;
  tokenType: string;
  context: string;
  status: string;
  createdAt: string;
  from: string | { _id: string; name: string };
  to: string | { _id: string; name: string };
}

interface Props {
  limit?: number;
}

export function TransactionList({ limit }: Props) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch('/api/wallet/transactions', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        setTransactions(limit ? data.transactions.slice(0, limit) : data.transactions);
      } else {
        toast.error('Failed to load transactions');
      }
    } catch (error: any) {
      toast.error(error.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-muted-foreground py-8 text-center animate-pulse">Loading transactions...</div>;
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground bg-card/30 rounded-xl border border-border/50">
        No transactions found.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {transactions.map((tx) => (
        <div key={tx._id} className="bg-card rounded-xl border border-border p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all hover:border-primary/30">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-full ${tx.type === 'credit' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
              {tx.type === 'credit' ? '↓' : '↑'}
            </div>
            <div>
              <p className="font-semibold text-white capitalize">{tx.context.replace('_', ' ')}</p>
              <p className="text-xs text-muted-foreground">{new Date(tx.createdAt).toLocaleString()}</p>
              <p className="text-xs font-mono text-muted-foreground/60 mt-1">ID: {tx.transactionId}</p>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <span className={`font-bold ${tx.type === 'credit' ? 'text-green-500' : 'text-red-500'}`}>
              {tx.type === 'credit' ? '+' : '-'}{tx.amount} {tx.tokenType}
            </span>
            <span className={`text-xs px-2 py-0.5 rounded-full mt-1 ${
              tx.status === 'completed' ? 'bg-green-500/20 text-green-400' :
              tx.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
              'bg-red-500/20 text-red-400'
            }`}>
              {tx.status}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
