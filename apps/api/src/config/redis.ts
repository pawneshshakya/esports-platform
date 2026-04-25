// apps/api/src/config/redis.ts
import Redis from 'ioredis';
import { config } from './env';

let redis: Redis | null = null;

export const connectRedis = async (): Promise<Redis | null> => {
    // Agar Redis disabled hai toh skip karo
    if (config.REDIS_ENABLED === 'false' || !config.REDIS_URL) {
        console.log('⚠️ Redis is disabled or URL not provided');
        return null;
    }

    try {
        redis = new Redis(config.REDIS_URL, {
            retryStrategy: (times) => {
                if (times > 3) {
                    console.log('⚠️ Redis connection failed after retries, continuing without cache');
                    return null; // Stop retrying
                }
                return Math.min(times * 100, 3000);
            },
            maxRetriesPerRequest: 3,
            enableReadyCheck: true,
            lazyConnect: true, // Pehle connect mat karo, jab zarurat ho tab
        });

        redis.on('connect', () => {
            console.log('✅ Redis Connected Successfully');
        });

        redis.on('error', (err) => {
            console.log('⚠️ Redis Error:', err.message);
        });

        // Explicitly connect
        await redis.connect().catch(() => {
            console.log('⚠️ Could not connect to Redis, running without cache');
            redis = null;
        });

        return redis;
    } catch (error) {
        console.log('⚠️ Redis initialization failed:', error);
        return null;
    }
};

export const getRedis = (): Redis | null => redis;

export const disconnectRedis = async (): Promise<void> => {
    if (redis) {
        await redis.quit();
        console.log('🔌 Redis Disconnected');
        redis = null;
    }
};