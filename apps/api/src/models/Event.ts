
// apps/api/src/models/Event.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IEvent extends Document {
  title: string;
  description: string;
  game: 'free_fire_max' | 'bgmi' | 'other';
  gameMode: string;
  createdBy: mongoose.Types.ObjectId;
  creatorType: 'user' | 'partner' | 'admin';
  eventType: 'local' | 'online' | 'sponsored' | 'premium';
  entryFee: number;
  prizePool: {
    total: number;
    breakdown: Array<{ position: number; amount: number }>;
  };
  maxParticipants: number;
  currentParticipants: mongoose.Types.ObjectId[];
  location?: {
    type: 'Point';
    coordinates: [number, number];
    address?: string;
    city?: string;
  };
  approvalStatus: 'pending' | 'approved' | 'rejected';
  approvedBy?: mongoose.Types.ObjectId;
  approvalNotes?: string;
  requiresApproval: boolean;
  scheduledAt: Date;
  registrationDeadline: Date;
  duration: number;
  room?: {
    roomId: string;
    password?: string;
    map?: string;
    perspective?: string;
  };
  mediator?: mongoose.Types.ObjectId;
  mediatorFee: number;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  shareableLink: string;
}

const EventSchema = new Schema<IEvent>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    game: { 
      type: String, 
      enum: ['free_fire_max', 'bgmi', 'other'], 
      required: true 
    },
    gameMode: { type: String, required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    creatorType: { 
      type: String, 
      enum: ['user', 'partner', 'admin'], 
      required: true 
    },
    eventType: { 
      type: String, 
      enum: ['local', 'online', 'sponsored', 'premium'], 
      default: 'local' 
    },
    entryFee: { type: Number, required: true, min: 0 },
    prizePool: {
      total: { type: Number, required: true },
      breakdown: [{
        position: { type: Number, required: true },
        amount: { type: Number, required: true }
      }]
    },
    maxParticipants: { type: Number, required: true, min: 2 },
    currentParticipants: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], index: '2dsphere' },
      address: String,
      city: String
    },
    approvalStatus: { 
      type: String, 
      enum: ['pending', 'approved', 'rejected'], 
      default: 'pending' 
    },
    approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    approvalNotes: String,
    requiresApproval: { type: Boolean, default: true },
    scheduledAt: { type: Date, required: true },
    registrationDeadline: { type: Date, required: true },
    duration: { type: Number, default: 60 },
    room: {
      roomId: { type: String, sparse: true },
      password: String,
      map: String,
      perspective: { type: String, enum: ['TPP', 'FPP'] }
    },
    mediator: { type: Schema.Types.ObjectId, ref: 'User' },
    mediatorFee: { type: Number, default: 0 },
    status: { 
      type: String, 
      enum: ['upcoming', 'ongoing', 'completed', 'cancelled'], 
      default: 'upcoming' 
    },
    shareableLink: { type: String, unique: true, sparse: true }
  },
  { timestamps: true }
);

EventSchema.index({ status: 1, scheduledAt: 1 });
EventSchema.index({ game: 1, eventType: 1 });
EventSchema.index({ createdBy: 1 });
EventSchema.index({ location: '2dsphere' });

export const Event = mongoose.model<IEvent>('Event', EventSchema);