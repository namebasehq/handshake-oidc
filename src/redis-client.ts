import Redis from 'ioredis';
import { redis as config } from './config';

export const redis = {
	createClient: (opt) => new Redis(config.port, config.host, { password: config.password, ...opt }),
};
