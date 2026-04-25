import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { User } from '../models/User';
import { Transaction } from '../models/Transaction';
import bcrypt from 'bcryptjs';
import { sseService } from '../services/sse.service';

export const getWallet = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user!._id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ wallet: user.wallet });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const setupWalletPassword = async (req: AuthRequest, res: Response) => {
  try {
    const { profilePassword, transactionPin } = req.body;
    const user = await User.findById(req.user!._id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    user.wallet.profilePassword = await bcrypt.hash(profilePassword, 10);
    user.wallet.transactionPin = await bcrypt.hash(transactionPin, 10);
    await user.save();
    
    res.json({ success: true, message: 'Wallet security set up successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const transferTokens = async (req: AuthRequest, res: Response) => {
  try {
    const { receiverAccountNumber, amount, profilePassword, transactionPin, note } = req.body;
    const sender = await User.findById(req.user!._id);
    if (!sender) return res.status(404).json({ error: 'Sender not found' });
    
    if (!sender.wallet.profilePassword || !sender.wallet.transactionPin) {
      return res.status(400).json({ error: 'Wallet security not set up' });
    }
    
    const validProfile = await bcrypt.compare(profilePassword, sender.wallet.profilePassword);
    const validPin = await bcrypt.compare(transactionPin, sender.wallet.transactionPin);
    
    if (!validProfile || !validPin) {
      return res.status(401).json({ error: 'Invalid security credentials' });
    }
    
    if (sender.wallet.balance < amount) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }
    
    const receiver = await User.findOne({ 'wallet.accountNumber': receiverAccountNumber });
    if (!receiver) return res.status(404).json({ error: 'Receiver not found' });
    
    sender.wallet.balance -= amount;
    receiver.wallet.balance += amount;
    
    await sender.save();
    await receiver.save();
    
    const transaction = await Transaction.create({
      transactionId: `TRX${Date.now()}`,
      type: 'transfer',
      from: sender._id,
      to: receiver._id,
      amount,
      tokenType: 'winnings',
      context: 'transfer',
      status: 'completed',
      metadata: { note }
    });
    
    res.json({ success: true, transaction });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getTransactions = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!._id;
    const transactions = await Transaction.find({
      $or: [{ from: userId }, { to: userId }]
    }).sort({ createdAt: -1 });
    res.json({ transactions });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const requestWithdrawal = async (req: AuthRequest, res: Response) => {
  try {
    const { amount, method, upiId, bankDetails } = req.body;
    const userId = req.user!._id;

    const config = await (await import('../models/Config')).Config.getSingleton();
    if (amount < config.minWithdrawal) return res.status(400).json({ error: `Minimum withdrawal is ${config.minWithdrawal}` });
    if (amount > config.maxWithdrawal) return res.status(400).json({ error: `Maximum withdrawal is ${config.maxWithdrawal}` });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (user.wallet.balance < amount) return res.status(400).json({ error: 'Insufficient balance' });

    // KYC required for > 10000
    if (amount > 10000) {
      const kyc = await (await import('../models/KYC')).KYC.findOne({ user: userId });
      if (!kyc || kyc.status !== 'approved') {
        return res.status(400).json({ 
          error: 'KYC verification required for withdrawals above 10,000',
          requiresKYC: true
        });
      }
    }

    user.wallet.balance -= amount;
    await user.save();

    const withdrawal = await (await import('../models/Withdrawal')).Withdrawal.create({
      user: userId,
      amount,
      method,
      upiId,
      bankDetails,
      status: 'pending'
    });

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

    sseService.broadcastToEvent('admin_channel', {
      type: 'new_withdrawal',
      data: { withdrawalId: withdrawal._id, amount, user: user.name }
    });

    res.json({ success: true, withdrawalId: withdrawal._id, status: 'pending' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getWithdrawalStatus = async (req: AuthRequest, res: Response) => {
  try {
    const withdrawals = await (await import('../models/Withdrawal')).Withdrawal
      .find({ user: req.user!._id })
      .sort({ createdAt: -1 });
    res.json({ withdrawals });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};