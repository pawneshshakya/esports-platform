
// apps/api/src/middleware/deviceFingerprint.ts
import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
import { User } from '../models/User';
import crypto from 'crypto';

export const checkDeviceFingerprint = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userAgent = req.headers['user-agent'] || '';
    const ip = req.ip || '';
    const rawFingerprint = `${userAgent}:${ip}`;
    const fingerprint = crypto.createHash('sha256').update(rawFingerprint).digest('hex');

    const user = await User.findById(req.user!._id);
    if (!user) return next();

    // Check if device is trusted
    const trustedDevice = user.trustedDevices?.find(d => d.fingerprint === fingerprint);
    
    if (trustedDevice) {
      trustedDevice.lastUsed = new Date();
      await user.save();
      (req as any).deviceFingerprint = fingerprint;
      return next();
    }

    // New device - add to trusted (you can add email verification here for extra security)
    if (!user.trustedDevices) user.trustedDevices = [];
    user.trustedDevices.push({
      fingerprint,
      userAgent,
      ip,
      lastUsed: new Date()
    });

    // Limit to 5 devices
    if (user.trustedDevices.length > 5) {
      user.trustedDevices = user.trustedDevices.slice(-5);
    }

    await user.save();
    (req as any).deviceFingerprint = fingerprint;
    next();
  } catch (error) {
    next();
  }
};