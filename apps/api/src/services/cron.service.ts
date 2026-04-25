
// apps/api/src/services/cron.service.ts
import cron from 'node-cron';
import { Event } from '../models/Event';
import { User } from '../models/User';
import { Room } from '../models/Room';

export const initCronJobs = () => {
  // Every 5 minutes: Update event statuses
  cron.schedule('*/5 * * * *', async () => {
    console.log('Running event status updater...');
    const now = new Date();

    // Upcoming -> Ongoing
    await Event.updateMany(
      { status: 'upcoming', scheduledAt: { $lte: now } },
      { status: 'ongoing' }
    );

    // Ongoing -> Completed (after duration)
    const ongoingEvents = await Event.find({ status: 'ongoing' });
    for (const event of ongoingEvents) {
      const endTime = new Date(event.scheduledAt.getTime() + event.duration * 60000);
      if (now > endTime) {
        event.status = 'completed';
        await event.save();
      }
    }
  });

  // Daily at midnight: Check subscription expiry
  cron.schedule('0 0 * * *', async () => {
    console.log('Checking expired subscriptions...');
    const now = new Date();
    
    await User.updateMany(
      { 'subscription.expiresAt': { $lt: now }, role: { $ne: 'free' } },
      { 
        $set: { 
          role: 'free', 
          'subscription.type': 'none',
          adsEnabled: true 
        } 
      }
    );
  });

  // Every hour: Cleanup old pending events (24h past deadline)
  cron.schedule('0 * * * *', async () => {
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
    await Event.updateMany(
      { 
        status: 'upcoming', 
        approvalStatus: 'pending',
        createdAt: { $lt: cutoff }
      },
      { status: 'cancelled' }
    );
  });
};