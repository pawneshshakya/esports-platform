
// apps/api/src/middleware/largeTransfer2FA.ts
import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
import { Config } from '../models/Config';
import { EmailVerification } from '../models/EmailVerification';
import { emailService } from '../services/email.service';
import crypto from 'crypto';

export const require2FAForLargeTransfer = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { amount, twoFACode } = req.body;
    const config = await Config.getSingleton();

    if (amount >= config.transferLimits.twoFAThreshold) {
      if (!twoFACode) {
        // Generate and send OTP
        const otp = crypto.randomInt(100000, 999999).toString();
        await EmailVerification.create({
          email: req.user!.email,
          userId: req.user!._id,
          otp,
          expiresAt: new Date(Date.now() + 10 * 60 * 1000)
        });
        await emailService.sendVerificationEmail(req.user!.email, otp, req.user!.name);
        return res.status(403).json({ 
          error: '2FA required for large transfers',
          requires2FA: true,
          message: 'OTP sent to your email'
        });
      }

      // Verify OTP
      const record = await EmailVerification.findOne({
        userId: req.user!._id,
        otp: twoFACode,
        verified: false,
        expiresAt: { $gt: new Date() }
      });

      if (!record) {
        return res.status(400).json({ error: 'Invalid or expired OTP' });
      }

      record.verified = true;
      await record.save();
    }

    next();
  } catch (error) {
    res.status(500).json({ error: '2FA check failed' });
  }
};