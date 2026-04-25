
// apps/api/src/middleware/subscriptionCheck.ts
import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
import { User } from '../models/User';

export const requireActiveSubscription = (...allowedRoles: string[]) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const user = await User.findById(req.user!._id);
      if (!user) return res.status(404).json({ error: 'User not found' });

      // Check if userType matches allowed roles
      if (!allowedRoles.includes(user.userType)) {
        return res.status(403).json({ error: `Requires: ${allowedRoles.join(' or ')}` });
      }

      // Check subscription expiry for partner/mediator
      if ((user.userType === 'partner' || user.userType === 'mediator') && user.subscription?.expiresAt) {
        if (new Date() > new Date(user.subscription.expiresAt)) {
          user.role = 'free';
          user.userType = 'user'; // Revert to user
          user.subscription = { type: 'none' };
          await user.save();
          return res.status(403).json({ error: 'Subscription expired. Please renew.' });
        }
      }

      next();
    } catch (error) {
      res.status(500).json({ error: 'Subscription check failed' });
    }
  };
};