
// apps/api/src/controllers/user.controller.ts
import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { User } from '../models/User';

export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const { name, bio, gamingIds, socialLinks } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.user!._id,
      { 
        $set: { 
          name, 
          'profile.bio': bio,
          'profile.gamingIds': gamingIds,
          'profile.socialLinks': socialLinks
        } 
      },
      { new: true }
    ).select('-wallet.profilePassword -wallet.transactionPin');

    res.json({ success: true, user });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const uploadAvatar = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file' });
    
    const avatarUrl = `/uploads/avatars/${req.file.filename}`;
    await User.findByIdAndUpdate(req.user!._id, { avatar: avatarUrl });
    
    res.json({ success: true, avatarUrl });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};