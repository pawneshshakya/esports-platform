import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends Document {
  email: string;
  password: string;
  name: string;
  username: string;
  phone?: string;
  role: "user" | "admin" | "free" | "premium" | "base";
  userType: "user" | "admin" | "partner" | "mediator";
  refreshToken?: string;
  isVerified: boolean;
  isEmailVerified: boolean;
  isActive: boolean;
  adsEnabled: boolean;
  avatar?: string;
  emailVerificationToken?: string;
  emailVerificationExpires?: Date;
  subscription?: {
    type: string;
    expiresAt?: Date;
    startedAt?: Date;
  };
  trustedDevices?: {
    fingerprint: string;
    userAgent: string;
    ip: string;
    lastUsed: Date;
  }[];
  kycStatus?: "none" | "pending" | "approved" | "rejected";
  isKYCApproved: boolean;
  gamingIds?: {
    game: string;
    playerId: string;
  }[];
  profile: {
    stats: {
      totalMatches: number;
      wins: number;
      earnings: number;
      winRate: number;
    };
  };
  friends: mongoose.Types.ObjectId[];
  friendRequests: {
    _id?: mongoose.Types.ObjectId;
    from: mongoose.Types.ObjectId;
    status: "pending" | "accepted" | "rejected";
    sentAt: Date;
  }[];
  wallet: {
    accountNumber: string;
    balance: number;
    isLocked: boolean;
    profilePassword?: string;
    transactionPin?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false,
    },
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    username: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      enum: ["user", "admin", "free", "premium", "base"],
      default: "user",
    },
    userType: {
      type: String,
      enum: ["user", "admin", "partner", "mediator"],
      default: "user",
    },
    refreshToken: {
      type: String,
      default: null,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    adsEnabled: {
      type: Boolean,
      default: true,
    },
    avatar: {
      type: String,
      default: null,
    },
    emailVerificationToken: String,
    emailVerificationExpires: Date,
    subscription: {
      type: {
        type: String,
        default: "none",
      },
      expiresAt: Date,
      startedAt: Date,
    },
    kycStatus: {
      type: String,
      enum: ["none", "pending", "approved", "rejected"],
      default: "none",
    },
    isKYCApproved: {
      type: Boolean,
      default: false,
    },
    trustedDevices: [
      {
        fingerprint: String,
        userAgent: String,
        ip: String,
        lastUsed: { type: Date, default: Date.now },
      },
    ],
    gamingIds: [
      {
        game: String,
        playerId: String,
      },
    ],
    profile: {
      stats: {
        totalMatches: { type: Number, default: 0 },
        wins: { type: Number, default: 0 },
        earnings: { type: Number, default: 0 },
        winRate: { type: Number, default: 0 },
      },
    },
    friends: [{ type: Schema.Types.ObjectId, ref: "User", default: [] }],
    friendRequests: [
      {
        from: { type: Schema.Types.ObjectId, ref: "User", required: true },
        status: {
          type: String,
          enum: ["pending", "accepted", "rejected"],
          default: "pending",
        },
        sentAt: { type: Date, default: Date.now },
      },
    ],
    wallet: {
      accountNumber: {
        type: String,
        unique: true,
        sparse: true,
      },
      balance: {
        type: Number,
        default: 0,
      },
      isLocked: {
        type: Boolean,
        default: false,
      },
      profilePassword: {
        type: String,
        select: false,
      },
      transactionPin: {
        type: String,
        select: false,
      },
    },
  },
  {
    timestamps: true,
  },
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (
  candidatePassword: string,
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model<IUser>("User", userSchema);
export default User;
