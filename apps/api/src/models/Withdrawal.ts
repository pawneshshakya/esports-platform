
// apps/api/src/models/Withdrawal.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IWithdrawal extends Document {
  user: mongoose.Types.ObjectId;
  amount: number;
  method: 'upi' | 'bank_transfer';
  upiId?: string;
  bankDetails?: {
    accountNumber: string;
    ifscCode: string;
    accountHolderName: string;
  };
  status: 'pending' | 'approved' | 'rejected' | 'processed';
  processedBy?: mongoose.Types.ObjectId;
  processedAt?: Date;
  remarks?: string;
  kycDocument?: string;
}

const WithdrawalSchema = new Schema<IWithdrawal>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true, min: 100 },
    method: { type: String, enum: ['upi', 'bank_transfer'], required: true },
    upiId: String,
    bankDetails: {
      accountNumber: String,
      ifscCode: String,
      accountHolderName: String
    },
    status: { type: String, enum: ['pending', 'approved', 'rejected', 'processed'], default: 'pending' },
    processedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    processedAt: Date,
    remarks: String,
    kycDocument: String
  },
  { timestamps: true }
);

export const Withdrawal = mongoose.model<IWithdrawal>('Withdrawal', WithdrawalSchema);