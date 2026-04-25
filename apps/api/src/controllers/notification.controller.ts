
// apps/api/src/controllers/notification.controller.ts
import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { Notification } from '../models/Notification';

export const getNotifications = async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const notifications = await Notification.find({ recipient: req.user!._id })
      .sort({ createdAt: -1 })
      .skip((page - 1) * 20)
      .limit(20);
    
    res.json({ notifications });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const markAsRead = async (req: AuthRequest, res: Response) => {
  try {
    await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user!._id },
      { isRead: true }
    );
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteNotification = async (req: AuthRequest, res: Response) => {
  try {
    await Notification.deleteOne({ _id: req.params.id, recipient: req.user!._id });
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getUnreadCount = async (req: AuthRequest, res: Response) => {
  try {
    const count = await Notification.countDocuments({ recipient: req.user!._id, isRead: false });
    res.json({ count });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};