
// apps/api/src/models/Message.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage extends Document {
  roomId: string;
  sender: mongoose.Types.ObjectId;
  text: string;
  type: 'text' | 'image';
  createdAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    roomId: { type: String, required: true, index: true },
    sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true },
    type: { type: String, enum: ['text', 'image'], default: 'text' }
  },
  { timestamps: true }
);

export const Message = mongoose.model<IMessage>('Message', MessageSchema);