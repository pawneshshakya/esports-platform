
// apps/api/src/models/Transaction.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface ITransaction extends Document {
  transactionId: string;
  type: 'credit' | 'debit' | 'transfer' | 'refund';
  from?: mongoose.Types.ObjectId;
  to: mongoose.Types.ObjectId;
  amount: number;
  tokenType: 'deposit' | 'winnings' | 'bonus';
  context: 'event_entry' | 'event_prize' | 'subscription' | 'transfer' | 'withdrawal';
  eventId?: mongoose.Types.ObjectId;
  status: 'pending' | 'completed' | 'failed' | 'reversed';
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

const TransactionSchema = new Schema<ITransaction>(
  {
    transactionId: { type: String, required: true, unique: true, index: true },
    type: { 
      type: String, 
      enum: ['credit', 'debit', 'transfer', 'refund'], 
      required: true 
    },
    from: { type: Schema.Types.ObjectId, ref: 'User' },
    to: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true, min: 0 },
    tokenType: { 
      type: String, 
      enum: ['deposit', 'winnings', 'bonus'], 
      required: true 
    },
    context: { 
      type: String, 
      enum: ['event_entry', 'event_prize', 'subscription', 'transfer', 'withdrawal'], 
      required: true 
    },
    eventId: { type: Schema.Types.ObjectId, ref: 'Event' },
    status: { 
      type: String, 
      enum: ['pending', 'completed', 'failed', 'reversed'], 
      default: 'pending' 
    },
    metadata: Schema.Types.Mixed,
    ipAddress: String,
    userAgent: String
  },
  { timestamps: true }
);

export const Transaction = mongoose.model<ITransaction>('Transaction', TransactionSchema);