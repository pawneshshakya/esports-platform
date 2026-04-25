export interface User {
  id: string;
  name: string;
  email: string;
  username: string;
  userType: "user" | "partner" | "mediator" | "admin";
  role: "free" | "base" | "premium";
  avatar?: string;
  wallet: {
    accountNumber: string;
    balance: number;
  };
  subscription?: {
    type: string;
    expiresAt?: string;
  };
  profile?: {
    stats?: {
      totalMatches?: number;
      wins?: number;
      winRate?: number;
      earnings?: number;
    };
  };
}

export interface Event {
  _id: string;
  title: string;
  description: string;
  game: "free_fire_max" | "bgmi" | "other";
  gameMode: string;
  entryFee: number;
  prizePool: {
    total: number;
    breakdown: Array<{ position: number; amount: number }>;
  };
  maxParticipants: number;
  currentParticipants: string[];
  scheduledAt: string;
  status: string;
  shareableLink: string;
  createdBy: string;
  approvalStatus: string;
}

export interface Notification {
  _id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  priority: string;
  actionUrl?: string;
}

export interface Transaction {
  _id: string;
  transactionId: string;
  type: "credit" | "debit" | "transfer" | "refund";
  amount: number;
  status: string;
  createdAt: string;
}

export interface Room {
  _id: string;
  roomCode: string;
  status: string;
  players: Array<{
    userId: string;
    gamingId: string;
    status: string;
  }>;
  screenshots: Array<{
    uploadedBy: string;
    imageUrl: string;
    likes: string[];
    dislikes: Array<{ userId: string; reason?: string }>;
  }>;
}