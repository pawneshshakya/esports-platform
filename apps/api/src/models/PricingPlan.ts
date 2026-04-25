
// apps/api/src/models/PricingPlan.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IPricingPlan extends Document {
  name: string;
  planId: string; // unique identifier like 'base_mediator', 'partner_pro'
  price: number;
  duration: 'monthly' | 'yearly';
  features: string[];
  targetRole: 'mediator' | 'partner' | 'user';
  adsEnabled: boolean;
  isActive: boolean;
  displayOrder: number;
}

const PricingPlanSchema = new Schema<IPricingPlan>(
  {
    name: { type: String, required: true },
    planId: { type: String, required: true, unique: true },
    price: { type: Number, required: true },
    duration: { type: String, enum: ['monthly', 'yearly'], default: 'monthly' },
    features: [{ type: String }],
    targetRole: { type: String, enum: ['mediator', 'partner', 'user'], required: true },
    adsEnabled: { type: Boolean, default: true },
    isActive: { type: Boolean, default: true },
    displayOrder: { type: Number, default: 0 }
  },
  { timestamps: true }
);

export const PricingPlan = mongoose.model<IPricingPlan>('PricingPlan', PricingPlanSchema);