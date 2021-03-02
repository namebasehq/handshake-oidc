import * as sapper from '@sapper/server';
import { RewriteFrames } from '@sentry/integrations';
import * as Sentry from '@sentry/node';
import compression from 'compression';
import redisConnect from 'connect-redis';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import type { Request, Response } from 'express';
import express from 'express';
import rateLimit from 'express-rate-limit';
import session from 'express-session';
import helmet from 'helmet';
import logger from 'morgan';
import { config, sentry } from './config';
import { redis } from './redis-client';
import oidcProviderRouter from './routes/oidc-provider';

export type SapperSession = {};

const rootDir = __dirname ?? process.cwd();

export function setupPreMiddlewares(app) {
	app.get('/healthz', (req, res) => {
		res.send('ok');
	});
	app.use((req, res, next) => {
		if (process.env.NODE_ENV === 'production') {
			if (req.headers['x-forwarded-proto'] !== 'https')
				return res.redirect('https://' + req.headers.host + req.url);
			else return next();
		} else {
			return next();
		}
	});
	Sentry.init({
		dsn: sentry,
		integrations: [
			new RewriteFrames({
				root: rootDir,
			}),
		],
	});

	const RedisStore = redisConnect(session);
	const limiter = rateLimit({
		windowMs: 15 * 60 * 1000, // 15 minutes
		max: 1000, // limit each IP to 100 requests per windowMs
	});

	app.use(Sentry.Handlers.requestHandler());
	app.set('trust proxy', true);
	app.use(helmet({ contentSecurityPolicy: false }));
	app.use(cors());
	app.use(limiter);
	app.use(
		session({
			store: new RedisStore({ client: redis.createClient({ keyPrefix: 'session:' }) }),
			secret: config.session_secret,
			resave: false,
			saveUninitialized: true,
			cookie: { secure: app.get('env') === 'production' },
		}),
	);
	app.use(logger('dev'));
	app.use(express.urlencoded({ extended: false }));
	app.use(cookieParser());
	app.use(compression({ threshold: 0 }))

	app.use(compression({ threshold: 0 }));
	app.use(express.static('static'));
	app.use('/oidc', oidcProviderRouter);
	app.use(
		sapper.middleware({
			session: async (req: Request, _: Response) => { },
		}),
	);

	return app;
}

export function setupPostMiddlewares(app) {
	app.use(Sentry.Handlers.errorHandler());

	function notFound(req: Request, res: Response, next: (error: Error) => void) {
		res.status(404);
		const error = new Error(`🔍 - Not Found - ${req.originalUrl}`);
		next(error);
	}

	function errorHandler(error: Error, _req: Request, res: Response, _next: () => void) {
		const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
		res.status(statusCode);
		res.json({
			message: error.message,
			stack: process.env.NODE_ENV === 'production' ? '🥞' : error.stack,
		});
	}

	app.use(notFound, errorHandler);

	return app;
}
