
// apps/api/src/validations/index.ts
import { z } from 'zod';

export const createEventSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().min(10),
  game: z.enum(['free_fire_max', 'bgmi', 'other']),
  gameMode: z.string().min(1),
  entryFee: z.number().min(0),
  prizePool: z.object({
    total: z.number().min(0),
    breakdown: z.array(z.object({
      position: z.number(),
      amount: z.number()
    }))
  }),
  maxParticipants: z.number().min(2).max(100),
  scheduledAt: z.string().datetime(),
  registrationDeadline: z.string().datetime(),
  eventType: z.enum(['local', 'online', 'sponsored', 'premium']).default('local'),
  location: z.object({
    coordinates: z.tuple([z.number(), z.number()]),
    address: z.string().optional(),
    city: z.string().optional()
  }).optional(),
  roomDetails: z.object({
    map: z.string().optional(),
    perspective: z.enum(['TPP', 'FPP']).optional()
  }).optional()
});

export const transferSchema = z.object({
  receiverAccountNumber: z.string().min(5),
  amount: z.number().positive().max(10000),
  profilePassword: z.string().min(6),
  transactionPin: z.string().length(4),
  note: z.string().max(200).optional()
});

export const createBlogSchema = z.object({
  title: z.string().min(5).max(200),
  content: z.string().min(50),
  excerpt: z.string().min(10).max(500),
  category: z.string().min(1),
  tags: z.array(z.string()).max(10),
  coverImage: z.string().url().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().max(160).optional()
});

export const withdrawalSchema = z.object({
  amount: z.number().min(100).max(50000),
  method: z.enum(['upi', 'bank_transfer']),
  upiId: z.string().optional(),
  bankDetails: z.object({
    accountNumber: z.string(),
    ifscCode: z.string(),
    accountHolderName: z.string()
  }).optional()
}).refine(data => {
  if (data.method === 'upi') return !!data.upiId;
  if (data.method === 'bank_transfer') return !!data.bankDetails;
  return false;
}, { message: 'Payment details required' });

export const pricingPlanSchema = z.object({
  name: z.string().min(2),
  planId: z.string().regex(/^[a-z0-9_]+$/),
  price: z.number().positive(),
  duration: z.enum(['monthly', 'yearly']),
  features: z.array(z.string()),
  targetRole: z.enum(['mediator', 'partner', 'user']),
  adsEnabled: z.boolean().default(true),
  displayOrder: z.number().default(0)
});

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50),
  email: z.string().email('Invalid email').refine((val) => val.endsWith('@gmail.com'), {
    message: 'Only Gmail addresses are allowed'
  }),
  username: z.string().min(3).max(20).regex(/^[a-zA-Z0-9_]+$/, 'Only letters, numbers and underscores'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain uppercase letter')
    .regex(/[a-z]/, 'Must contain lowercase letter')
    .regex(/[0-9]/, 'Must contain number')
    .regex(/[^A-Za-z0-9]/, 'Must contain special character')
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, 'Password is required')
});
