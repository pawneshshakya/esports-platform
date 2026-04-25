
// apps/api/src/controllers/chat.controller.ts
import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { Message } from '../models/Message';
import { sseService } from '../services/sse.service';

export const getMessages = async (req: AuthRequest, res: Response) => {
  try {
    const { roomId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    
    const messages = await Message.find({ roomId })
      .populate('sender', 'name username avatar')
      .sort({ createdAt: -1 })
      .skip((page - 1) * 50)
      .limit(50);

    res.json({ messages: messages.reverse() });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const sendMessage = async (req: AuthRequest, res: Response) => {
  try {
    const { roomId } = req.params;
    const { text } = req.body;

    const message = new Message({
      roomId,
      sender: req.user!._id,
      text,
      type: 'text'
    });

    await message.save();
    await message.populate('sender', 'name username avatar');

    // Broadcast via SSE
    sseService.broadcastToRoom(roomId, {
      type: 'chat_message',
      data: message
    });

    res.json({ success: true, message });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};