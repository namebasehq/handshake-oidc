import Redis from 'ioredis';
import {config } from './config';

export const redis = {
    createClient: (opt) => new Redis(config.redis.port, config.redis.host, { password: config.redis.password, ...opt })
}
