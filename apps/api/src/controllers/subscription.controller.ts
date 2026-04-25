
// apps/api/src/controllers/subscription.controller.ts
import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { User } from '../models/User';
import { PricingPlan } from '../models/PricingPlan';
import { Transaction } from '../models/Transaction';
import { razorpay, verifyPayment } from '../services/razorpay.service';
import { sseService } from '../services/sse.service';

export const getPlans = async (req: AuthRequest, res: Response) => {
  try {
    const plans = await PricingPlan.find({ isActive: true }).sort({ displayOrder: 1 });
    res.json({ plans });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createOrder = async (req: AuthRequest, res: Response) => {
  try {
    const { planId } = req.body;
    const plan = await PricingPlan.findById(planId);
    if (!plan) return res.status(404).json({ error: 'Plan not found' });

    const order = await razorpay.orders.create({
      amount: plan.price * 100, // paise
      currency: 'INR',
      receipt: `sub_${Date.now()}`,
      notes: {
        userId: req.user!._id.toString(),
        planId: plan._id.toString(),
        targetRole: plan.targetRole
      }
    });

    res.json({ orderId: order.id, amount: order.amount, currency: order.currency, plan });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const verifyAndActivate = async (req: AuthRequest, res: Response) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, planId } = req.body;

    const isValid = verifyPayment(razorpay_order_id, razorpay_payment_id, razorpay_signature);
    if (!isValid) return res.status(400).json({ error: 'Invalid payment signature' });

    const plan = await PricingPlan.findById(planId);
    if (!plan) return res.status(404).json({ error: 'Plan not found' });

    const user = await User.findById(req.user!._id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Update subscription
    const now = new Date();
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + (plan.duration === 'yearly' ? 12 : 1));

    user.subscription = {
      type: plan.targetRole === 'partner' ? 'premium' : 'base',
      startedAt: now,
      expiresAt
    };
    user.role = plan.targetRole === 'partner' ? 'premium' : 'base';
    
    // If mediator plan, update userType
    if (plan.targetRole === 'mediator' && user.userType === 'user') {
      user.userType = 'mediator';
    }
    // If partner plan, update userType
    if (plan.targetRole === 'partner' && user.userType === 'user') {
      user.userType = 'partner';
    }

    user.adsEnabled = plan.adsEnabled;

    await user.save();

    // Transaction log
    await Transaction.create({
      transactionId: razorpay_payment_id,
      type: 'debit',
      from: user._id,
      to: user._id, // System
      amount: plan.price,
      tokenType: 'deposit',
      context: 'subscription',
      status: 'completed',
      metadata: { planId, orderId: razorpay_order_id }
    });

    sseService.sendNotification(user._id.toString(), {
      type: 'system',
      title: 'Subscription Activated',
      message: `${plan.name} is now active until ${expiresAt.toDateString()}`
    });

    res.json({ success: true, subscription: user.subscription });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};