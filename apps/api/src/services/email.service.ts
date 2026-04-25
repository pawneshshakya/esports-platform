import nodemailer from 'nodemailer';
import { config } from '../config/env';

const APP_URL = config.CLIENT_URL || 'http://localhost:3000';

// Create reusable transporter
const transporter = nodemailer.createTransport({
  host: config.SMTP_HOST || 'smtp.gmail.com',
  port: Number(config.SMTP_PORT) || 587,
  secure: config.SMTP_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: config.SMTP_USER,
    pass: config.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false, // Development ke liye
  },
});

// Verify connection on startup
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ SMTP Connection Error:', error.message);
  } else {
    console.log('✅ Gmail SMTP Server Ready');
  }
});

export class EmailService {
  private static async sendMail(to: string, subject: string, html: string) {
    try {
      const info = await transporter.sendMail({
        from: config.EMAIL_FROM || '"Esports Pro" <noreply@gmail.com>',
        to,
        subject,
        html,
      });
      console.log('📧 Email sent:', info.messageId);
      return info;
    } catch (error: any) {
      console.error('❌ Email send failed:', error.message);
      throw error;
    }
  }

  static async sendVerificationEmail(email: string, name: string, token: string) {
    const verifyUrl = `${APP_URL}/verify-email?token=${token}`;

    const html = `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f0f0f; color: #ffffff; padding: 40px; border-radius: 16px; border: 1px solid #333;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #a855f7; font-size: 28px; margin: 0;">ESPORTS PRO</h1>
          <p style="color: #888; margin: 5px 0 0;">Compete. Win. Earn.</p>
        </div>
        
        <h2 style="color: #fff; font-size: 22px; margin-bottom: 10px;">Hello ${name},</h2>
        <p style="color: #bbb; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
          Thank you for registering! Please verify your email address to activate your account and start competing.
        </p>
        
        <div style="text-align: center; margin: 35px 0;">
          <a href="${verifyUrl}" 
             style="background: linear-gradient(135deg, #9333ea, #db2777); color: white; padding: 14px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block; box-shadow: 0 4px 15px rgba(147, 51, 234, 0.3);">
            Verify My Email
          </a>
        </div>
        
        <p style="color: #666; font-size: 13px; text-align: center; margin-bottom: 20px;">
          Or copy and paste this link:
        </p>
        <p style="color: #a855f7; word-break: break-all; font-size: 12px; text-align: center; background: #1a1a1a; padding: 10px; border-radius: 6px; border: 1px solid #333;">
          ${verifyUrl}
        </p>
        
        <div style="border-top: 1px solid #333; margin-top: 35px; padding-top: 20px;">
          <p style="color: #555; font-size: 12px; line-height: 1.5;">
            This link will expire in <strong style="color: #888;">24 hours</strong>. If you didn't create an account, please ignore this email.
          </p>
        </div>
      </div>
    `;

    return this.sendMail(email, 'Verify Your Email - Esports Pro', html);
  }

  static async sendWelcomeEmail(email: string, name: string) {
    const html = `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f0f0f; color: #ffffff; padding: 40px; border-radius: 16px; border: 1px solid #333;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #a855f7; font-size: 28px; margin: 0;">ESPORTS PRO</h1>
          <p style="color: #888; margin: 5px 0 0;">Compete. Win. Earn.</p>
        </div>
        
        <h2 style="color: #fff; font-size: 22px; margin-bottom: 10px;">Welcome ${name}! 🎉</h2>
        <p style="color: #bbb; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
          Hey ${name}, your email has been verified successfully. You're all set to join tournaments and win big!
        </p>
        
        <div style="text-align: center; margin: 35px 0;">
          <a href="${APP_URL}/tournaments" 
             style="background: linear-gradient(135deg, #9333ea, #db2777); color: white; padding: 14px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block; box-shadow: 0 4px 15px rgba(147, 51, 234, 0.3);">
            Explore Tournaments
          </a>
        </div>
        
        <div style="border-top: 1px solid #333; margin-top: 35px; padding-top: 20px;">
          <p style="color: #555; font-size: 12px; line-height: 1.5; text-align: center;">
            Need help? Contact us at <a href="mailto:support@esportspro.com" style="color: #a855f7;">support@esportspro.com</a>
          </p>
        </div>
      </div>
    `;

    return this.sendMail(email, 'Welcome to Esports Pro!', html);
  }

  static async sendPasswordResetEmail(email: string, name: string, token: string) {
    const resetUrl = `${APP_URL}/reset-password?token=${token}`;

    const html = `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f0f0f; color: #ffffff; padding: 40px; border-radius: 16px; border: 1px solid #333;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #a855f7; font-size: 28px; margin: 0;">ESPORTS PRO</h1>
          <p style="color: #888; margin: 5px 0 0;">Compete. Win. Earn.</p>
        </div>
        
        <h2 style="color: #fff; font-size: 22px; margin-bottom: 10px;">Password Reset Request</h2>
        <p style="color: #bbb; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
          Hello ${name}, we received a request to reset your password. Click the button below to set a new password.
        </p>
        
        <div style="text-align: center; margin: 35px 0;">
          <a href="${resetUrl}" 
             style="background: linear-gradient(135deg, #9333ea, #db2777); color: white; padding: 14px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block; box-shadow: 0 4px 15px rgba(147, 51, 234, 0.3);">
            Reset Password
          </a>
        </div>
        
        <p style="color: #666; font-size: 13px; text-align: center; margin-bottom: 20px;">
          Or copy and paste this link:
        </p>
        <p style="color: #a855f7; word-break: break-all; font-size: 12px; text-align: center; background: #1a1a1a; padding: 10px; border-radius: 6px; border: 1px solid #333;">
          ${resetUrl}
        </p>
        
        <div style="border-top: 1px solid #333; margin-top: 35px; padding-top: 20px;">
          <p style="color: #555; font-size: 12px; line-height: 1.5;">
            This link will expire in <strong style="color: #888;">1 hour</strong>. If you didn't request this, please ignore this email or secure your account.
          </p>
        </div>
      </div>
    `;

    return this.sendMail(email, 'Reset Your Password - Esports Pro', html);
  }

  static async sendTournamentRegistrationEmail(email: string, name: string, tournamentName: string, tournamentDate: string, tournamentUrl: string) {
    const html = `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f0f0f; color: #ffffff; padding: 40px; border-radius: 16px; border: 1px solid #333;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #a855f7; font-size: 28px; margin: 0;">ESPORTS PRO</h1>
          <p style="color: #888; margin: 5px 0 0;">Compete. Win. Earn.</p>
        </div>
        
        <h2 style="color: #fff; font-size: 22px; margin-bottom: 10px;">You're In! 🏆</h2>
        <p style="color: #bbb; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
          Hey ${name}, you've successfully registered for <strong style="color: #a855f7;">${tournamentName}</strong>!
        </p>
        
        <div style="background: #1a1a1a; border: 1px solid #333; border-radius: 10px; padding: 20px; margin-bottom: 25px;">
          <p style="color: #888; margin: 0 0 8px; font-size: 14px;">Tournament Date</p>
          <p style="color: #fff; margin: 0; font-size: 18px; font-weight: bold;">${tournamentDate}</p>
        </div>
        
        <div style="text-align: center; margin: 35px 0;">
          <a href="${tournamentUrl}" 
             style="background: linear-gradient(135deg, #9333ea, #db2777); color: white; padding: 14px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block; box-shadow: 0 4px 15px rgba(147, 51, 234, 0.3);">
            View Tournament Details
          </a>
        </div>
        
        <div style="border-top: 1px solid #333; margin-top: 35px; padding-top: 20px;">
          <p style="color: #555; font-size: 12px; line-height: 1.5;">
            Good luck! May the best player win. 🎮
          </p>
        </div>
      </div>
    `;

    return this.sendMail(email, `Registered: ${tournamentName} - Esports Pro`, html);
  }

  static async sendMatchReminderEmail(email: string, name: string, opponentName: string, matchTime: string, matchUrl: string) {
    const html = `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f0f0f; color: #ffffff; padding: 40px; border-radius: 16px; border: 1px solid #333;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #a855f7; font-size: 28px; margin: 0;">ESPORTS PRO</h1>
          <p style="color: #888; margin: 5px 0 0;">Compete. Win. Earn.</p>
        </div>
        
        <h2 style="color: #fff; font-size: 22px; margin-bottom: 10px;">Match Starting Soon! ⚡</h2>
        <p style="color: #bbb; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
          Hey ${name}, your match against <strong style="color: #a855f7;">${opponentName}</strong> is about to begin!
        </p>
        
        <div style="background: #1a1a1a; border: 1px solid #333; border-radius: 10px; padding: 20px; margin-bottom: 25px; text-align: center;">
          <p style="color: #888; margin: 0 0 8px; font-size: 14px;">Match Time</p>
          <p style="color: #fff; margin: 0; font-size: 22px; font-weight: bold;">${matchTime}</p>
        </div>
        
        <div style="text-align: center; margin: 35px 0;">
          <a href="${matchUrl}" 
             style="background: linear-gradient(135deg, #9333ea, #db2777); color: white; padding: 14px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block; box-shadow: 0 4px 15px rgba(147, 51, 234, 0.3);">
            Join Match
          </a>
        </div>
        
        <div style="border-top: 1px solid #333; margin-top: 35px; padding-top: 20px;">
          <p style="color: #555; font-size: 12px; line-height: 1.5;">
            Don't be late! Matches start on time. Good luck! 🎯
          </p>
        </div>
      </div>
    `;

    return this.sendMail(email, 'Match Reminder - Esports Pro', html);
  }

  static async sendPrizeWonEmail(email: string, name: string, tournamentName: string, prizeAmount: string, claimUrl: string) {
    const html = `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f0f0f; color: #ffffff; padding: 40px; border-radius: 16px; border: 1px solid #333;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #a855f7; font-size: 28px; margin: 0;">ESPORTS PRO</h1>
          <p style="color: #888; margin: 5px 0 0;">Compete. Win. Earn.</p>
        </div>
        
        <h2 style="color: #fff; font-size: 22px; margin-bottom: 10px;">Congratulations ${name}! 🎉</h2>
        <p style="color: #bbb; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
          You won <strong style="color: #a855f7;">${prizeAmount}</strong> in <strong style="color: #a855f7;">${tournamentName}</strong>! Amazing performance!
        </p>
        
        <div style="background: linear-gradient(135deg, #1a1a1a, #2d1b4e); border: 1px solid #a855f7; border-radius: 10px; padding: 25px; margin-bottom: 25px; text-align: center;">
          <p style="color: #888; margin: 0 0 8px; font-size: 14px;">Prize Amount</p>
          <p style="color: #a855f7; margin: 0; font-size: 32px; font-weight: bold;">${prizeAmount}</p>
        </div>
        
        <div style="text-align: center; margin: 35px 0;">
          <a href="${claimUrl}" 
             style="background: linear-gradient(135deg, #9333ea, #db2777); color: white; padding: 14px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block; box-shadow: 0 4px 15px rgba(147, 51, 234, 0.3);">
            Claim Your Prize
          </a>
        </div>
        
        <div style="border-top: 1px solid #333; margin-top: 35px; padding-top: 20px;">
          <p style="color: #555; font-size: 12px; line-height: 1.5;">
            Prize must be claimed within <strong style="color: #888;">7 days</strong>. Keep dominating the leaderboards! 🏆
          </p>
        </div>
      </div>
    `;

    return this.sendMail(email, `You Won ${prizeAmount}! - Esports Pro`, html);
  }

  static async sendAccountSecurityAlert(email: string, name: string, activity: string, time: string) {
    const html = `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f0f0f; color: #ffffff; padding: 40px; border-radius: 16px; border: 1px solid #333;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #a855f7; font-size: 28px; margin: 0;">ESPORTS PRO</h1>
          <p style="color: #888; margin: 5px 0 0;">Compete. Win. Earn.</p>
        </div>
        
        <h2 style="color: #ef4444; font-size: 22px; margin-bottom: 10px;">Security Alert ⚠️</h2>
        <p style="color: #bbb; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
          Hey ${name}, we detected a new sign-in or activity on your account.
        </p>
        
        <div style="background: #1a1a1a; border: 1px solid #333; border-radius: 10px; padding: 20px; margin-bottom: 25px;">
          <p style="color: #888; margin: 0 0 8px; font-size: 14px;">Activity</p>
          <p style="color: #fff; margin: 0 0 15px; font-size: 16px; font-weight: bold;">${activity}</p>
          <p style="color: #888; margin: 0 0 8px; font-size: 14px;">Time</p>
          <p style="color: #fff; margin: 0; font-size: 16px; font-weight: bold;">${time}</p>
        </div>
        
        <div style="text-align: center; margin: 35px 0;">
          <a href="${APP_URL}/security" 
             style="background: linear-gradient(135deg, #9333ea, #db2777); color: white; padding: 14px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block; box-shadow: 0 4px 15px rgba(147, 51, 234, 0.3);">
            Review Account Activity
          </a>
        </div>
        
        <div style="border-top: 1px solid #333; margin-top: 35px; padding-top: 20px;">
          <p style="color: #555; font-size: 12px; line-height: 1.5;">
            If this wasn't you, please <a href="${APP_URL}/reset-password" style="color: #ef4444;">change your password immediately</a> and contact support.
          </p>
        </div>
      </div>
    `;

    return this.sendMail(email, 'Security Alert - Esports Pro', html);
  }

  static async sendEventApproved(email: string, eventTitle: string) {
    const html = `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f0f0f; color: #ffffff; padding: 40px; border-radius: 16px; border: 1px solid #333;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #a855f7; font-size: 28px; margin: 0;">ESPORTS PRO</h1>
          <p style="color: #888; margin: 5px 0 0;">Compete. Win. Earn.</p>
        </div>
        
        <h2 style="color: #fff; font-size: 22px; margin-bottom: 10px;">Event Approved! 🚀</h2>
        <p style="color: #bbb; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
          Great news! Your event <strong style="color: #a855f7;">${eventTitle}</strong> has been approved and is now live for registration.
        </p>
        
        <div style="text-align: center; margin: 35px 0;">
          <a href="${APP_URL}/events" 
             style="background: linear-gradient(135deg, #9333ea, #db2777); color: white; padding: 14px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block; box-shadow: 0 4px 15px rgba(147, 51, 234, 0.3);">
            View Your Event
          </a>
        </div>
        
        <div style="border-top: 1px solid #333; margin-top: 35px; padding-top: 20px;">
          <p style="color: #555; font-size: 12px; line-height: 1.5; text-align: center;">
            Need help managing your event? Reply to this email.
          </p>
        </div>
      </div>
    `;

    return this.sendMail(email, `Event Approved: ${eventTitle}`, html);
  }
}

export const emailService = EmailService;