// apps/api/src/controllers/event.controller.ts - ADD THESE FUNCTIONS

import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { Config } from '../models/Config';
import { Transaction } from '../models/Transaction';
import { Notification } from '../models/Notification';
import { emailService } from '../services/email.service';
import { Event } from '../models/Event';
import { User } from '../models/User';
import { Room } from '../models/Room';
import { sseService } from '../services/sse.service';

export const getEvents = async (req: AuthRequest, res: Response) => {
  try {
    const events = await Event.find({ status: 'upcoming' }).sort({ scheduledAt: 1 });
    res.json({ events });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getEventById = async (req: AuthRequest, res: Response) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ error: 'Event not found' });
    res.json({ event });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const joinEvent = async (req: AuthRequest, res: Response) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ error: 'Event not found' });
    
    if (event.currentParticipants.includes(req.user!._id as any)) {
      return res.status(400).json({ error: 'Already joined' });
    }
    
    event.currentParticipants.push(req.user!._id as any);
    await event.save();
    
    res.json({ success: true, message: 'Joined successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};


export const createEvent = async (req: AuthRequest, res: Response) => {
  try {
    const { entryFee } = req.body;
    const user = req.user!;
    
    // DYNAMIC LIMITS from DB
    const config = await Config.getSingleton();
    let requiresApproval = true;
    let approvalStatus = 'pending';
    
    if (user.userType === 'user' && entryFee <= config.approvalLimits.user) {
      requiresApproval = false;
      approvalStatus = 'approved';
    } else if (user.userType === 'partner' && entryFee <= config.approvalLimits.partner) {
      requiresApproval = false;
      approvalStatus = 'approved';
    }

    // ... rest same as before
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const cancelEvent = async (req: AuthRequest, res: Response) => {
  const session = await Event.startSession();
  session.startTransaction();

  try {
    const { eventId } = req.params;
    const userId = req.user!._id;

    const event = await Event.findById(eventId).session(session);
    if (!event) throw new Error('Event not found');
    if (event.createdBy.toString() !== userId.toString() && req.user!.userType !== 'admin') {
      throw new Error('Unauthorized');
    }
    if (event.status === 'ongoing' || event.status === 'completed') {
      throw new Error('Cannot cancel ongoing/completed event');
    }

    event.status = 'cancelled';
    await event.save({ session });

    // REFUND ALL PARTICIPANTS
    const participants = await User.find({ _id: { $in: event.currentParticipants } }).session(session);
    for (const participant of participants) {
      participant.wallet.balance += event.entryFee;
      await participant.save({ session });

      await Transaction.create([{
        transactionId: `REF${Date.now()}${Math.floor(Math.random()*1000)}`,
        type: 'refund',
        to: participant._id,
        amount: event.entryFee,
        tokenType: 'deposit',
        context: 'event_entry',
        eventId: event._id,
        status: 'completed'
      }], { session });

      // Notifications
      await Notification.create([{
        recipient: participant._id,
        type: 'system',
        title: 'Event Cancelled',
        message: `"${event.title}" was cancelled. ${event.entryFee} tokens refunded.`,
        priority: 'high'
      }], { session });

      sseService.sendNotification(participant._id.toString(), {
        type: 'wallet_credit',
        title: 'Refund Processed',
        message: `${event.entryFee} tokens refunded for cancelled event`
      });
    }

    await session.commitTransaction();
    res.json({ success: true, message: 'Event cancelled and refunds processed' });
  } catch (error: any) {
    await session.abortTransaction();
    res.status(500).json({ error: error.message });
  } finally {
    session.endSession();
  }
};

export const approveEvent = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user!.userType !== 'admin') {
      return res.status(403).json({ error: 'Admin only' });
    }

    const { eventId } = req.params;
    const { status, notes } = req.body; // 'approved' or 'rejected'

    const event = await Event.findById(eventId).populate('createdBy');
    if (!event) return res.status(404).json({ error: 'Not found' });

    event.approvalStatus = status;
    event.approvedBy = req.user!._id as any;
    event.approvalNotes = notes;

    if (status === 'approved') {
      event.status = 'upcoming';
      // Create room automatically
      const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      const room = new Room({
        eventId: event._id,
        roomCode,
        createdBy: event.createdBy._id,
        players: [],
        status: 'waiting'
      });
      await room.save();
      event.room = { roomId: roomCode };
      
      // Email creator
      await emailService.sendEventApproved((event.createdBy as any).email, event.title);
    } else if (status === 'rejected') {
      event.status = 'cancelled';
      // Auto-refund if any participants joined (edge case: they shouldn't have before approval but safety first)
      // ... refund logic similar to cancelEvent
    }

    await event.save();

    // Notify creator
    await Notification.create({
      recipient: event.createdBy._id,
      type: 'event_approval',
      title: `Event ${status === 'approved' ? 'Approved' : 'Rejected'}`,
      message: `Your event "${event.title}" has been ${status}${notes ? ': ' + notes : ''}`,
      priority: 'high',
      data: { eventId: event._id, status }
    });

    sseService.sendNotification((event.createdBy as any)._id.toString(), {
      type: 'event_approval',
      title: `Event ${status}`,
      message: `"${event.title}" is ${status}`
    });

    res.json({ success: true, event });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const searchEvents = async (req: AuthRequest, res: Response) => {
  try {
    const { 
      q, 
      game, 
      minFee, 
      maxFee, 
      city, 
      status = 'upcoming',
      sortBy = 'scheduledAt',
      page = 1 
    } = req.query;

    const query: any = { status, approvalStatus: 'approved' };

    if (q) {
      query.$or = [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } }
      ];
    }
    if (game) query.game = game;
    if (minFee || maxFee) {
      query.entryFee = {};
      if (minFee) query.entryFee.$gte = Number(minFee);
      if (maxFee) query.entryFee.$lte = Number(maxFee);
    }
    if (city) query['location.city'] = { $regex: city, $options: 'i' };

    const sort: any = {};
    if (sortBy === 'prize') sort['prizePool.total'] = -1;
    else if (sortBy === 'fee') sort.entryFee = 1;
    else sort.scheduledAt = 1;

    const events = await Event.find(query)
      .populate('createdBy', 'name username avatar')
      .sort(sort)
      .skip((+page - 1) * 12)
      .limit(12);

    const total = await Event.countDocuments(query);

    res.json({ events, total, pages: Math.ceil(total / 12) });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};