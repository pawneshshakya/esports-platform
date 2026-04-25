
// apps/api/src/controllers/withdrawal.controller.ts
import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { User } from '../models/User';
import { Withdrawal } from '../models/Withdrawal';
import { Transaction } from '../models/Transaction';
import { sseService } from '../services/sse.service';

export const requestWithdrawal = async (req: AuthRequest, res: Response) => {
  try {
    const { amount, method, upiId, bankDetails } = req.body;
    const userId = req.user!._id;

    if (amount < 100) return res.status(400).json({ error: 'Minimum withdrawal is 100 tokens' });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (user.wallet.balance < amount) return res.status(400).json({ error: 'Insufficient balance' });

    // KYC required for > 10,000
    let kycDoc = undefined;
    if (amount > 10000) {
      if (!req.file) return res.status(400).json({ error: 'KYC document required for withdrawals > 10,000' });
      kycDoc = `/uploads/kyc/${req.file.filename}`;
    }

    // Deduct balance immediately (hold)
    user.wallet.balance -= amount;
    await user.save();

    const withdrawal = new Withdrawal({
      user: userId,
      amount,
      method,
      upiId,
      bankDetails,
      kycDocument: kycDoc,
      status: 'pending'
    });

    await withdrawal.save();

    // Transaction log
    await Transaction.create({
      transactionId: `WDL${Date.now()}`,
      type: 'debit',
      from: userId,
      to: userId,
      amount,
      tokenType: 'winnings',
      context: 'withdrawal',
      status: 'pending'
    });

    // Notify admin
    sseService.broadcastToEvent('admin_channel', {
      type: 'new_withdrawal',
      data: { withdrawalId: withdrawal._id, amount, user: user.name }
    });

    res.json({ success: true, withdrawalId: withdrawal._id });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getWithdrawals = async (req: AuthRequest, res: Response) => {
  try {
    const query = req.user!.userType === 'admin' ? {} : { user: req.user!._id };
    const withdrawals = await Withdrawal.find(query)
      .populate('user', 'name email username')
      .sort({ createdAt: -1 });
    res.json({ withdrawals });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const processWithdrawal = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user!.userType !== 'admin') return res.status(403).json({ error: 'Admin only' });

    const { withdrawalId } = req.params;
    const { status, remarks } = req.body; // approved, rejected

    const withdrawal = await Withdrawal.findById(withdrawalId).populate('user');
    if (!withdrawal) return res.status(404).json({ error: 'Not found' });

    withdrawal.status = status;
    withdrawal.processedBy = req.user!._id as any;
    withdrawal.processedAt = new Date();
    withdrawal.remarks = remarks;
    await withdrawal.save();

    // If rejected, refund user
    if (status === 'rejected') {
      const user = await User.findById(withdrawal.user._id);
      if (user) {
        user.wallet.balance += withdrawal.amount;
        await user.save();
      }
    }

    sseService.sendNotification((withdrawal.user as any)._id.toString(), {
      type: 'wallet_credit',
      title: `Withdrawal ${status}`,
      message: `Your withdrawal of ${withdrawal.amount} tokens has been ${status}`
    });

    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};