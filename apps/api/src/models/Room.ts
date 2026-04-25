
// apps/api/src/models/Room.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IRoom extends Document {
  eventId: mongoose.Types.ObjectId;
  roomCode: string;
  createdBy: mongoose.Types.ObjectId;
  players: Array<{
    userId: mongoose.Types.ObjectId;
    gamingId: string;
    teamNumber?: number;
    joinedAt: Date;
    status: 'joined' | 'ready' | 'playing' | 'finished';
  }>;
  mediator?: mongoose.Types.ObjectId;
  mediatorStatus: 'assigned' | 'accepted' | 'reviewing' | 'completed';
  status: 'waiting' | 'ongoing' | 'screenshot_upload' | 'voting' | 'mediator_review' | 'completed' | 'disputed';
  startedAt?: Date;
  endedAt?: Date;
  screenshots: Array<{
    uploadedBy: mongoose.Types.ObjectId;
    imageUrl: string;
    thumbnailUrl?: string;
    uploadedAt: Date;
    likes: mongoose.Types.ObjectId[];
    dislikes: Array<{ userId: mongoose.Types.ObjectId; reason?: string }>;
  }>;
  votingDeadline?: Date;
  votingStatus: 'pending' | 'approved' | 'rejected';
  mediatorReview?: {
    startedAt?: Date;
    deadline?: Date;
    result?: 'win' | 'disputed' | 'cancelled';
    winner?: mongoose.Types.ObjectId;
    notes?: string;
    screenshotVerified: boolean;
  };
  finalResult?: {
    winners: Array<{
      userId: mongoose.Types.ObjectId;
      position: number;
      prize: number;
    }>;
    distributed: boolean;
  };
  room?: {
    game: string;
    gameMode: string;
    map: string;
    maxPlayers: number;
    password?: string;
    isDirect: boolean;
  };
}

const RoomSchema = new Schema<IRoom>(
  {
    eventId: { type: Schema.Types.ObjectId, ref: 'Event', required: true },
    roomCode: { type: String, required: true, unique: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    players: [{
      userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
      gamingId: { type: String, required: true },
      teamNumber: Number,
      joinedAt: { type: Date, default: Date.now },
      status: {
        type: String,
        enum: ['joined', 'ready', 'playing', 'finished'],
        default: 'joined'
      }
    }],
    mediator: { type: Schema.Types.ObjectId, ref: 'User' },
    mediatorStatus: {
      type: String,
      enum: ['assigned', 'accepted', 'reviewing', 'completed'],
      default: 'assigned'
    },
    status: {
      type: String,
      enum: ['waiting', 'ongoing', 'screenshot_upload', 'voting', 'mediator_review', 'completed', 'disputed'],
      default: 'waiting'
    },
    startedAt: Date,
    endedAt: Date,
    screenshots: [{
      uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
      imageUrl: { type: String, required: true },
      thumbnailUrl: String,
      uploadedAt: { type: Date, default: Date.now },
      likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
      dislikes: [{
        userId: { type: Schema.Types.ObjectId, ref: 'User' },
        reason: String
      }]
    }],
    votingDeadline: Date,
    votingStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    mediatorReview: {
      startedAt: Date,
      deadline: Date,
      result: { type: String, enum: ['win', 'disputed', 'cancelled'] },
      winner: { type: Schema.Types.ObjectId, ref: 'User' },
      notes: String,
      screenshotVerified: { type: Boolean, default: false }
    },
    finalResult: {
      winners: [{
        userId: { type: Schema.Types.ObjectId, ref: 'User' },
        position: Number,
        prize: Number
      }],
      distributed: { type: Boolean, default: false }
    },
    room: {
      game: String,
      gameMode: String,
      map: String,
      maxPlayers: Number,
      password: { type: String, select: false },
      isDirect: { type: Boolean, default: false }
    }
  },
  { timestamps: true }
);

export const Room = mongoose.model<IRoom>('Room', RoomSchema);