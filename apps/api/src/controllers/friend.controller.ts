
// apps/api/src/controllers/friend.controller.ts
import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { User } from '../models/User';
import { Notification } from '../models/Notification';
import { sseService } from '../services/sse.service';

export const sendFriendRequest = async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.body;
    const fromId = req.user!._id;

    if (fromId.toString() === userId) {
      return res.status(400).json({ error: 'Cannot send request to yourself' });
    }

    const targetUser = await User.findById(userId);
    if (!targetUser) return res.status(404).json({ error: 'User not found' });

    // Check if already friends
    if (targetUser.friends.includes(fromId as any)) {
      return res.status(400).json({ error: 'Already friends' });
    }

    // Check if request already pending
    const existingRequest = targetUser.friendRequests?.find(
      r => r.from.toString() === fromId.toString() && r.status === 'pending'
    );
    if (existingRequest) {
      return res.status(400).json({ error: 'Request already pending' });
    }

    targetUser.friendRequests.push({
      from: fromId as any,
      status: 'pending',
      sentAt: new Date()
    });

    await targetUser.save();

    // Notification
    await Notification.create({
      recipient: userId,
      type: 'friend_request',
      title: 'New Friend Request',
      message: `${req.user!.name} sent you a friend request`,
      data: { fromId: fromId.toString() },
      priority: 'medium'
    });

    sseService.sendNotification(userId, {
      type: 'friend_request',
      title: 'New Friend Request',
      message: `${req.user!.name} wants to be friends`
    });

    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const respondFriendRequest = async (req: AuthRequest, res: Response) => {
  try {
    const { requestId, action } = req.body; // action: 'accepted' | 'rejected'
    const userId = req.user!._id;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const request = (user.friendRequests as any).id(requestId);
    if (!request) return res.status(404).json({ error: 'Request not found' });

    request.status = action;

    if (action === 'accepted') {
      user.friends.push(request.from);
      const fromUser = await User.findById(request.from);
      if (fromUser) {
        fromUser.friends.push(userId as any);
        await fromUser.save();
      }
    }

    await user.save();
    res.json({ success: true, action });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getFriends = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user!._id)
      .populate('friends', 'name username avatar wallet.accountNumber gamingIds')
      .populate('friendRequests.from', 'name username avatar');

    res.json({
      friends: user?.friends || [],
      requests: user?.friendRequests?.filter(r => r.status === 'pending') || []
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const searchUsers = async (req: AuthRequest, res: Response) => {
  try {
    const { q } = req.query;
    if (!q || typeof q !== 'string') {
      return res.status(400).json({ error: 'Query required' });
    }

    const users = await User.find({
      $or: [
        { username: { $regex: q, $options: 'i' } },
        { name: { $regex: q, $options: 'i' } }
      ],
      _id: { $ne: req.user!._id }
    })
      .select('name username avatar gamingIds')
      .limit(10);

    res.json({ users });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};