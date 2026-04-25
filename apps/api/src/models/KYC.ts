
// apps/api/src/models/KYC.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IKYC extends Document {
  user: mongoose.Types.ObjectId;
  documentType: 'pan' | 'aadhaar' | 'passport' | 'driving_license';
  documentNumber: string;
  frontImage: string;
  backImage?: string;
  selfieImage?: string;
  status: 'pending' | 'approved' | 'rejected';
  adminNotes?: string;
  reviewedBy?: mongoose.Types.ObjectId;
  reviewedAt?: Date;
}

const KYCSchema = new Schema<IKYC>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    documentType: { 
      type: String, 
      enum: ['pan', 'aadhaar', 'passport', 'driving_license'], 
      required: true 
    },
    documentNumber: { type: String, required: true },
    frontImage: { type: String, required: true },
    backImage: String,
    selfieImage: String,
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    adminNotes: String,
    reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: Date
  },
  { timestamps: true }
);

export const KYC = mongoose.model<IKYC>('KYC', KYCSchema);