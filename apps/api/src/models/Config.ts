// apps/api/src/models/Config.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IConfig extends Document {
  approvalLimits: {
    user: number;
    partner: number;
  };
  commissionRate: number;
  minWithdrawal: number;
  maxWithdrawal: number;
  transferLimits: {
    min: number;
    max: number;
    twoFAThreshold: number;
  };
  adSettings: {
    enabled: boolean;
    provider: string;
    slots: {
      header: boolean;
      sidebar: boolean;
      banner: boolean;
    };
  };
  updatedBy: mongoose.Types.ObjectId;
}

const ConfigSchema = new Schema<IConfig>(
  {
    approvalLimits: {
      user: { type: Number, default: 500 },
      partner: { type: Number, default: 2000 }
    },
    commissionRate: { type: Number, default: 5 }, // 5%
    minWithdrawal: { type: Number, default: 100 },
    maxWithdrawal: { type: Number, default: 50000 },
    transferLimits: {
      min: { type: Number, default: 1 },
      max: { type: Number, default: 10000 },
      twoFAThreshold: { type: Number, default: 1000 }
    },
    adSettings: {
      enabled: { type: Boolean, default: true },
      provider: { type: String, default: 'google_adsense' },
      slots: {
        header: { type: Boolean, default: true },
        sidebar: { type: Boolean, default: true },
        banner: { type: Boolean, default: true }
      }
    },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

interface ConfigModel extends mongoose.Model<IConfig> {
  getSingleton(): Promise<IConfig>;
}

// Singleton pattern - sirf ek document
ConfigSchema.statics.getSingleton = async function() {
  let config = await this.findOne();
  if (!config) {
    config = await this.create({});
  }
  return config;
};

export const Config = mongoose.model<IConfig, ConfigModel>('Config', ConfigSchema);