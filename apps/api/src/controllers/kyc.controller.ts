
// apps/api/src/controllers/kyc.controller.ts
import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { KYC } from '../models/KYC';
import { User } from '../models/User';
import { sseService } from '../services/sse.service';

export const submitKYC = async (req: AuthRequest, res: Response) => {
  try {
    const { documentType, documentNumber } = req.body;
    const userId = req.user!._id;

    const existing = await KYC.findOne({ user: userId });
    if (existing && existing.status === 'approved') {
      return res.status(400).json({ error: 'KYC already approved' });
    }

    const kyc = await KYC.findOneAndUpdate(
      { user: userId },
      {
        user: userId,
        documentType,
        documentNumber,
        frontImage: req.files?.['front'] ? `/uploads/kyc/${req.files['front'][0].filename}` : existing?.frontImage,
        backImage: req.files?.['back'] ? `/uploads/kyc/${req.files['back'][0].filename}` : existing?.backImage,
        selfieImage: req.files?.['selfie'] ? `/uploads/kyc/${req.files['selfie'][0].filename}` : existing?.selfieImage,
        status: 'pending'
      },
      { upsert: true, new: true }
    );

    await User.findByIdAndUpdate(userId, { kycStatus: 'pending' });

    // Notify admin
    sseService.broadcastToEvent('admin_channel', {
      type: 'new_kyc',
      data: { kycId: kyc._id, userId, documentType }
    });

    res.json({ success: true, kyc });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getMyKYC = async (req: AuthRequest, res: Response) => {
  try {
    const kyc = await KYC.findOne({ user: req.user!._id });
    res.json({ kyc });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const reviewKYC = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user!.userType !== 'admin') return res.status(403).json({ error: 'Admin only' });

    const { kycId } = req.params;
    const { status, notes } = req.body; // approved/rejected

    const kyc = await KYC.findById(kycId).populate('user');
    if (!kyc) return res.status(404).json({ error: 'Not found' });

    kyc.status = status;
    kyc.reviewedBy = req.user!._id as any;
    kyc.reviewedAt = new Date();
    kyc.adminNotes = notes;
    await kyc.save();

    await User.findByIdAndUpdate(kyc.user, { 
      kycStatus: status,
      // If approved, mark for withdrawals
      isKYCApproved: status === 'approved'
    });

    sseService.sendNotification((kyc.user as any)._id.toString(), {
      type: 'system',
      title: `KYC ${status === 'approved' ? 'Approved' : 'Rejected'}`,
      message: notes || `Your KYC verification is ${status}`
    });

    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getPendingKYC = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user!.userType !== 'admin') return res.status(403).json({ error: 'Admin only' });
    const kycs = await KYC.find({ status: 'pending' }).populate('user', 'name email username');
    res.json({ kycs });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};