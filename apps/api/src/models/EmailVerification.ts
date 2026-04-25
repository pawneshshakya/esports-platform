
// apps/api/src/models/EmailVerification.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IEmailVerification extends Document {
  email: string;
  userId: mongoose.Types.ObjectId;
  otp: string;
  expiresAt: Date;
  verified: boolean;
}

const EmailVerificationSchema = new Schema<IEmailVerification>(
  {
    email: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    otp: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    verified: { type: Boolean, default: false }
  },
  { timestamps: true }
);

EmailVerificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const EmailVerification = mongoose.model<IEmailVerification>('EmailVerification', EmailVerificationSchema);