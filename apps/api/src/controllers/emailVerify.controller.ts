
// apps/api/src/controllers/emailVerify.controller.ts
import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { EmailVerification } from '../models/EmailVerification';
import { User } from '../models/User';
import { emailService } from '../services/email.service';
import crypto from 'crypto';

export const sendVerificationOTP = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user!._id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (user.isEmailVerified) return res.status(400).json({ error: 'Already verified' });

    // Delete old OTPs
    await EmailVerification.deleteMany({ userId: user._id });

    const otp = crypto.randomInt(100000, 999999).toString();
    await EmailVerification.create({
      email: user.email,
      userId: user._id,
      otp,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000)
    });

    await emailService.sendVerificationEmail(user.email, otp, user.name);
    res.json({ success: true, message: 'OTP sent to email' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const verifyEmailOTP = async (req: AuthRequest, res: Response) => {
  try {
    const { otp } = req.body;
    
    const record = await EmailVerification.findOne({
      userId: req.user!._id,
      otp,
      verified: false,
      expiresAt: { $gt: new Date() }
    });

    if (!record) return res.status(400).json({ error: 'Invalid or expired OTP' });

    record.verified = true;
    await record.save();

    await User.findByIdAndUpdate(req.user!._id, { isEmailVerified: true });

    res.json({ success: true, message: 'Email verified successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const checkVerificationStatus = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user!._id).select('isEmailVerified email');
    res.json({ isVerified: user?.isEmailVerified, email: user?.email });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};