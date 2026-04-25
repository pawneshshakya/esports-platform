
// apps/api/src/controllers/admin.controller.ts
import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { User } from '../models/User';
import { Event } from '../models/Event';
import { Blog } from '../models/Blog';
import { Withdrawal } from '../models/Withdrawal';
import { PricingPlan } from '../models/PricingPlan';
import { Transaction } from '../models/Transaction';

export const getDashboardStats = async (req: AuthRequest, res: Response) => {
  try {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const [
      totalUsers,
      activeUsers,
      totalPartners,
      totalEvents,
      pendingEvents,
      pendingWithdrawals,
      todayRevenue,
      totalRevenue
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isActive: true }),
      User.countDocuments({ userType: 'partner' }),
      Event.countDocuments(),
      Event.countDocuments({ approvalStatus: 'pending' }),
      Withdrawal.countDocuments({ status: 'pending' }),
      Transaction.aggregate([
        { $match: { createdAt: { $gte: today }, status: 'completed', context: 'subscription' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Transaction.aggregate([
        { $match: { status: 'completed', context: 'subscription' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ])
    ]);

    res.json({
      totalUsers,
      activeUsers,
      totalPartners,
      totalEvents,
      pendingEvents,
      pendingWithdrawals,
      todayRevenue: todayRevenue[0]?.total || 0,
      totalRevenue: totalRevenue[0]?.total || 0
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getPendingApprovals = async (req: AuthRequest, res: Response) => {
  try {
    const [events, blogs, withdrawals] = await Promise.all([
      Event.find({ approvalStatus: 'pending' })
        .populate('createdBy', 'name email username')
        .sort({ createdAt: -1 }),
      Blog.find({ status: 'pending' })
        .populate('author', 'name email username')
        .sort({ submittedAt: -1 }),
      Withdrawal.find({ status: 'pending' })
        .populate('user', 'name email username')
        .sort({ createdAt: -1 })
    ]);

    res.json({ events, blogs, withdrawals });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const manageUser = async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const { action, userType, isActive } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (action === 'ban') user.isActive = false;
    if (action === 'unban') user.isActive = true;
    if (userType) user.userType = userType;
    if (typeof isActive === 'boolean') user.isActive = isActive;

    await user.save();
    res.json({ success: true, user });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getAllUsers = async (req: AuthRequest, res: Response) => {
  try {
    const { page = 1, search, userType } = req.query;
    const query: any = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { username: { $regex: search, $options: 'i' } }
      ];
    }
    if (userType) query.userType = userType;

    const users = await User.find(query)
      .select('-wallet.profilePassword -wallet.transactionPin')
      .sort({ createdAt: -1 })
      .skip((+page - 1) * 20)
      .limit(20);

    const total = await User.countDocuments(query);

    res.json({ users, total, pages: Math.ceil(total / 20) });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createPricingPlan = async (req: AuthRequest, res: Response) => {
  try {
    const plan = new PricingPlan(req.body);
    await plan.save();
    res.json({ success: true, plan });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updatePricingPlan = async (req: AuthRequest, res: Response) => {
  try {
    const { planId } = req.params;
    const plan = await PricingPlan.findByIdAndUpdate(planId, req.body, { new: true });
    if (!plan) return res.status(404).json({ error: 'Plan not found' });
    res.json({ success: true, plan });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deletePricingPlan = async (req: AuthRequest, res: Response) => {
  try {
    await PricingPlan.findByIdAndUpdate(req.params.planId, { isActive: false });
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};