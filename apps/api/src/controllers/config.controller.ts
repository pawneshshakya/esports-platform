
// apps/api/src/controllers/config.controller.ts
import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { Config } from '../models/Config';
import { sseService } from '../services/sse.service';

export const getPublicConfig = async (req: Request, res: Response) => {
  try {
    const config = await Config.getSingleton();
    res.json({
      approvalLimits: config.approvalLimits,
      commissionRate: config.commissionRate,
      minWithdrawal: config.minWithdrawal,
      maxWithdrawal: config.maxWithdrawal,
      transferLimits: {
        min: config.transferLimits.min,
        max: config.transferLimits.max
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateConfig = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user!.userType !== 'admin') {
      return res.status(403).json({ error: 'Admin only' });
    }

    const config = await Config.getSingleton();
    
    if (req.body.approvalLimits) {
      config.approvalLimits = { ...config.approvalLimits, ...req.body.approvalLimits };
    }
    if (req.body.commissionRate !== undefined) config.commissionRate = req.body.commissionRate;
    if (req.body.transferLimits) {
      config.transferLimits = { ...config.transferLimits, ...req.body.transferLimits };
    }
    if (req.body.adSettings) {
      config.adSettings = { ...config.adSettings, ...req.body.adSettings };
    }
    
    config.updatedBy = req.user!._id as any;
    await config.save();

    // Broadcast config update to all clients
    sseService.broadcastToEvent('global', {
      type: 'config_updated',
      data: config.toObject()
    });

    res.json({ success: true, config });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};