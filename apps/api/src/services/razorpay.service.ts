
// apps/api/src/services/razorpay.service.ts
import Razorpay from 'razorpay'; // npm install razorpay
import crypto from 'crypto';
import { config } from '../config/env';

export const razorpay = new Razorpay({
  key_id: config.RAZORPAY_KEY_ID!,
  key_secret: config.RAZORPAY_KEY_SECRET!
});

export const verifyPayment = (orderId: string, paymentId: string, signature: string) => {
  const body = orderId + '|' + paymentId;
  const expectedSignature = crypto
    .createHmac('sha256', config.RAZORPAY_KEY_SECRET!)
    .update(body.toString())
    .digest('hex');
  
  return expectedSignature === signature;
};