
// apps/api/src/services/encryption.service.ts
import crypto from 'crypto';
import { config } from '../config/env';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;
const SALT_LENGTH = 64;

export class EncryptionService {
  private static instance: EncryptionService;
  private masterKey: Buffer;

  private constructor() {
    // Master key ko PBKDF2 se derive karo for extra security
    const masterPassword = config.ENCRYPTION_MASTER_KEY;
    if (!masterPassword || masterPassword.length < 32) {
      throw new Error('Master key must be at least 32 characters');
    }
    this.masterKey = crypto.scryptSync(masterPassword, 'salt', 32);
  }

  static getInstance(): EncryptionService {
    if (!EncryptionService.instance) {
      EncryptionService.instance = new EncryptionService();
    }
    return EncryptionService.instance;
  }

  // Data encrypt karne ke liye
  encrypt(text: string): { encrypted: string; iv: string; tag: string } {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, this.masterKey, iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const tag = cipher.getAuthTag();
    
    return {
      encrypted,
      iv: iv.toString('hex'),
      tag: tag.toString('hex')
    };
  }

  // Data decrypt karne ke liye
  decrypt(encrypted: string, iv: string, tag: string): string {
    const decipher = crypto.createDecipheriv(
      ALGORITHM, 
      this.masterKey, 
      Buffer.from(iv, 'hex')
    );
    
    decipher.setAuthTag(Buffer.from(tag, 'hex'));
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  // String ko directly encrypt karke single string return karo (DB storage ke liye)
  encryptForStorage(text: string): string {
    const { encrypted, iv, tag } = this.encrypt(text);
    return `${iv}:${tag}:${encrypted}`;
  }

  decryptFromStorage(stored: string): string {
    const [iv, tag, encrypted] = stored.split(':');
    return this.decrypt(encrypted, iv, tag);
  }

  // Wallet account number generate karo (unique + encrypted storage)
  generateWalletAccountNumber(): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = crypto.randomBytes(4).toString('hex').toUpperCase();
    return `ES${timestamp}${random}`;
  }

  // Hash sensitive IDs (room passwords, etc)
  hashSensitiveData(data: string): string {
    return crypto.createHmac('sha256', this.masterKey).update(data).digest('hex');
  }
}

export const encryptionService = EncryptionService.getInstance();