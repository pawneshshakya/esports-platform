import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { AuthRequest } from '../middleware/auth';
import { Room } from '../models/Room';
import { Event } from '../models/Event';
import { User } from '../models/User';
import { Notification } from '../models/Notification';
import { Transaction } from '../models/Transaction';
import { sseService } from '../services/sse.service';
import { encryptionService } from '../services/encryption.service';

export const getRoom = async (req: AuthRequest, res: Response) => {
  try {
    const room = await Room.findById(req.params.id)
      .populate('createdBy', 'name username avatar')
      .populate('players.userId', 'name username avatar role')
      .populate('eventId');

    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    res.json({ success: true, room });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const uploadScreenshot = async (req: AuthRequest, res: Response) => {
  try {
    const { roomId } = req.params;
    const room = await Room.findById(roomId);
    if (!room) return res.status(404).json({ error: 'Room not found' });

    if (!req.file) return res.status(400).json({ error: 'No image uploaded' });

    room.screenshots.push({
      uploadedBy: req.user!._id,
      imageUrl: req.file.path,
      uploadedAt: new Date(),
      likes: [],
      dislikes: []
    });

    room.status = 'screenshot_upload';
    await room.save();

    res.json({ success: true, screenshot: req.file.path });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const verifyScreenshot = async (req: AuthRequest, res: Response) => {
  try {
    const { roomId, screenshotId, action, reason } = req.body;
    const room = await Room.findById(roomId);
    if (!room) return res.status(404).json({ error: 'Room not found' });

    const screenshot = room.screenshots.find((s: any) => s._id?.toString() === screenshotId);
    if (!screenshot) return res.status(404).json({ error: 'Screenshot not found' });

    if (action === 'like') {
      if (!screenshot.likes.includes(req.user!._id)) {
        screenshot.likes.push(req.user!._id);
      }
    } else if (action === 'dislike') {
      const alreadyDisliked = screenshot.dislikes.find(d => d.userId.toString() === req.user!._id.toString());
      if (!alreadyDisliked) {
        screenshot.dislikes.push({ userId: req.user!._id, reason });
      }
    }

    await room.save();
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const mediatorDecision = async (req: AuthRequest, res: Response) => {
  try {
    const { roomId, winnerId, notes, method } = req.body;

    await resolveRoomWithStats(roomId, winnerId, method || 'mediator');

    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createDirectRoom = async (req: AuthRequest, res: Response) => {
  try {
    const { game, gameMode, maxPlayers, map, password } = req.body;
    const userId = req.user!._id;

    // Generate room code
    const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    // Encrypt password if provided
    let encryptedPassword;
    if (password) {
      encryptedPassword = encryptionService.encryptForStorage(password);
    }

    const room = new Room({
      eventId: null, // No event - direct room
      roomCode,
      createdBy: userId,
      players: [{
        userId,
        gamingId: req.user!.gamingIds?.find((g: any) => g.game === game)?.playerId || '',
        teamNumber: 1,
        joinedAt: new Date(),
        status: 'joined'
      }],
      status: 'waiting',
      room: {
        game,
        gameMode,
        map,
        maxPlayers,
        password: encryptedPassword,
        isDirect: true
      }
    });

    await room.save();

    // Join SSE room
    sseService.joinRoom(userId.toString(), room._id.toString());

    res.json({
      success: true,
      room: {
        id: room._id,
        roomCode,
        game,
        gameMode,
        inviteLink: `/room/${room._id}?code=${roomCode}`
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const inviteFriendsToRoom = async (req: AuthRequest, res: Response) => {
  try {
    const { roomId } = req.params;
    const { friendIds } = req.body; // Array of user IDs

    const room = await Room.findById(roomId);
    if (!room) return res.status(404).json({ error: 'Room not found' });
    if (room.createdBy.toString() !== req.user!._id.toString()) {
      return res.status(403).json({ error: 'Only creator can invite' });
    }

    const event = room.eventId ? await Event.findById(room.eventId) : null;

    for (const friendId of friendIds) {
      // Check if friend
      const isFriend = await User.exists({ _id: req.user!._id, friends: friendId });
      if (!isFriend) continue;

      await Notification.create({
        recipient: friendId,
        type: 'room_update',
        title: 'Room Invitation',
        message: `${req.user!.name} invited you to join a ${room.room?.game || 'game'} room`,
        data: { roomId, roomCode: room.roomCode, eventId: room.eventId },
        priority: 'medium',
        actionUrl: `/room/${roomId}`
      });

      sseService.sendNotification(friendId, {
        type: 'room_invite',
        title: 'Room Invitation',
        message: `${req.user!.name} invited you!`,
        data: { roomId, roomCode: room.roomCode }
      });
    }

    res.json({ success: true, invited: friendIds.length });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// UPDATE resolveRoom function to include stats update
const resolveRoomWithStats = async (roomId: string, winnerId: string, method: string) => {
  const session = await Room.startSession();
  session.startTransaction();

  try {
    const room = await Room.findById(roomId).session(session);
    if (!room) throw new Error('Room not found');

    const event = room.eventId ? await Event.findById(room.eventId).session(session) : null;

    room.status = 'completed';
    room.mediatorReview = {
      ...room.mediatorReview,
      result: 'win',
      winner: winnerId as any,
      notes: `Resolved via ${method}`
    };

    // Calculate prizes from event
    const winners = [];
    if (event) {
      // Simple: Winner gets 1st prize
      const firstPrize = event.prizePool.breakdown.find(b => b.position === 1);
      if (firstPrize) {
        winners.push({ userId: winnerId, position: 1, prize: firstPrize.amount });

        // Credit winner
        const winner = await User.findById(winnerId).session(session);
        if (winner) {
          winner.wallet.balance += firstPrize.amount;

          // UPDATE STATS
          winner.profile.stats.totalMatches += 1;
          winner.profile.stats.wins += 1;
          winner.profile.stats.earnings += firstPrize.amount;
          winner.profile.stats.winRate = Math.round((winner.profile.stats.wins / winner.profile.stats.totalMatches) * 100);

          await winner.save({ session });

          await Transaction.create([{
            transactionId: `WIN${Date.now()}`,
            type: 'credit',
            to: winner._id,
            amount: firstPrize.amount,
            tokenType: 'winnings',
            context: 'event_prize',
            eventId: event._id,
            status: 'completed'
          }], { session });
        }

        // Update stats for all other players (loss)
        for (const player of room.players) {
          if (player.userId.toString() !== winnerId) {
            const loser = await User.findById(player.userId).session(session);
            if (loser) {
              loser.profile.stats.totalMatches += 1;
              loser.profile.stats.winRate = Math.round((loser.profile.stats.wins / loser.profile.stats.totalMatches) * 100);
              await loser.save({ session });
            }
          }
        }
      }
    }

    room.finalResult = { winners, distributed: true };
    await room.save({ session });
    await session.commitTransaction();

    // SSE broadcasts
    sseService.broadcastToRoom(roomId, {
      type: 'room_resolved',
      data: { winnerId, method, status: 'completed', prize: winners[0]?.prize }
    });

    sseService.sendNotification(winnerId, {
      type: 'wallet_credit',
      title: 'You Won!',
      message: `Congratulations! You won ${winners[0]?.prize || 0} tokens`
    });

  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

export const joinRoom = async (req: AuthRequest, res: Response) => {
  try {
    const { roomId, roomCode, password } = req.body;
    const userId = req.user!._id;

    const room = await Room.findById(roomId);
    if (!room) return res.status(404).json({ error: 'Room not found' });
    if (room.roomCode !== roomCode) return res.status(400).json({ error: 'Invalid room code' });

    // Check password for direct rooms
    if (room.room?.password) {
      const decrypted = encryptionService.decryptFromStorage(room.room.password);
      if (decrypted !== password) {
        return res.status(403).json({ error: 'Invalid password' });
      }
    }

    // Check if already in room
    const isAlreadyJoined = room.players.some(p => p.userId.toString() === userId.toString());
    if (isAlreadyJoined) {
      return res.status(400).json({ error: 'Already in room' });
    }

    // Check capacity
    const maxPlayers = room.room?.maxPlayers || room.eventId ? (await Event.findById(room.eventId))?.maxParticipants : 100;
    if (room.players.length >= (maxPlayers || 100)) {
      return res.status(400).json({ error: 'Room full' });
    }

    room.players.push({
      userId: userId as any,
      gamingId: req.user!.gamingIds?.find((g: any) => g.game === room.room?.game)?.playerId || '',
      joinedAt: new Date(),
      status: 'joined'
    });

    await room.save();

    // SSE join
    sseService.joinRoom(userId.toString(), roomId);
    sseService.broadcastToRoom(roomId, {
      type: 'player_joined',
      data: { userId, username: req.user!.username, totalPlayers: room.players.length }
    });

    res.json({ success: true, room });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};