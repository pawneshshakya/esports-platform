
'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { loadScript } from '@/utils/loadScript';
import { toast } from 'sonner';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function SubscriptionPage() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const { data: plans } = useQuery({
    queryKey: ['plans'],
    queryFn: async () => {
      const token = localStorage.getItem('accessToken');
      const res = await fetch('/api/subscriptions/plans', {
        headers: { Authorization: `Bearer ${token}` }
      });
      return res.json();
    }
  });

  const orderMutation = useMutation({
    mutationFn: async (planId: string) => {
      const token = localStorage.getItem('accessToken');
      const res = await fetch('/api/subscriptions/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ planId })
      });
      return res.json();
    }
  });

  const handlePayment = async (plan: any) => {
    const res = await loadScript('https://checkout.razorpay.com/v1/checkout.js');
    if (!res) {
      toast.error('Razorpay SDK failed to load');
      return;
    }

    const orderData = await orderMutation.mutateAsync(plan._id);

    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: orderData.amount,
      currency: orderData.currency,
      name: 'Esports Pro',
      description: `${plan.name} Subscription`,
      order_id: orderData.orderId,
      handler: async (response: any) => {
        const verifyRes = await fetch('/api/subscriptions/verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`
          },
          body: JSON.stringify({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            planId: plan._id
          })
        });
        const data = await verifyRes.json();
        if (data.success) {
          toast.success('Subscription activated!');
          window.location.reload();
        }
      },
      prefill: {
        name: 'User',
        email: 'user@example.com'
      },
      theme: { color: '#7c3aed' }
    };

    const paymentObject = new window.Razorpay(options);
    paymentObject.open();
  };

  return (
    <div className="min-h-screen bg-background text-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Choose Your Plan
        </h1>
        <p className="text-center text-muted-foreground mb-12">Upgrade to unlock premium features</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans?.plans?.map((plan: any) => (
            <div 
              key={plan._id}
              onClick={() => setSelectedPlan(plan._id)}
              className={`relative p-6 rounded-2xl border cursor-pointer transition-all ${
                selectedPlan === plan._id 
                  ? 'border-primary bg-primary text-primary-foreground/10' 
                  : 'border-border bg-card hover:border-border'
              }`}
            >
              {plan.targetRole === 'partner' && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-primary to-primary/60 text-xs font-bold px-3 py-1 rounded-full">
                  POPULAR
                </span>
              )}
              
              <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
              <div className="text-3xl font-bold text-primary mb-4">
                ₹{plan.price}
                <span className="text-sm text-muted-foreground font-normal">/{plan.duration}</span>
              </div>
              
              <ul className="space-y-3 mb-6">
                {plan.features.map((feature: string, i: number) => (
                  <li key={i} className="flex items-center text-sm text-gray-300">
                    <span className="text-green-400 mr-2">✓</span> {feature}
                  </li>
                ))}
              </ul>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handlePayment(plan);
                }}
                disabled={orderMutation.isPending}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 text-white font-bold py-2 rounded-lg transition-colors disabled:opacity-50"
              >
                {orderMutation.isPending ? 'Processing...' : 'Subscribe'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}