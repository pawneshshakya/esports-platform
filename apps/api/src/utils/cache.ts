// apps/api/src/utils/cache.ts
import { getRedis } from '../config/redis';

const DEFAULT_TTL = 3600; // 1 hour in seconds

export const cacheSet = async (key: string, value: any, ttl: number = DEFAULT_TTL): Promise<void> => {
    const redis = getRedis();
    if (!redis) return;

    try {
        await redis.setex(key, ttl, JSON.stringify(value));
    } catch (error) {
        console.log('Cache set error:', error);
    }
};

export const cacheGet = async <T>(key: string): Promise<T | null> => {
    const redis = getRedis();
    if (!redis) return null;

    try {
        const data = await redis.get(key);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.log('Cache get error:', error);
        return null;
    }
};

export const cacheDelete = async (key: string): Promise<void> => {
    const redis = getRedis();
    if (!redis) return;

    try {
        await redis.del(key);
    } catch (error) {
        console.log('Cache delete error:', error);
    }
};

export const cacheFlush = async (): Promise<void> => {
    const redis = getRedis();
    if (!redis) return;

    try {
        await redis.flushdb();
    } catch (error) {
        console.log('Cache flush error:', error);
    }
};