import * as sapper from '@sapper/server';
import compression from 'compression';
import redisConnect from 'connect-redis';
import cookieParser from 'cookie-parser';
import type { Request, Response } from 'express';
import express from 'express';
import session from 'express-session';
import helmet from 'helmet';
import oidcProviderRouter from './routes/oidc-provider';
import path from 'path';

import logger from 'morgan';
import cors from 'cors';
import { redis } from './redis-client';

import { config } from './config';

import rateLimit from 'express-rate-limit';

import * as Sentry from '@sentry/node';

import { RewriteFrames } from '@sentry/integrations';


export type SapperSession = {

};

const rootDir = __dirname ?? process.cwd();

export function setupPreMiddlewares(app) {
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
		dsn: config.sentry,
		integrations: [
			new RewriteFrames({
				root: rootDir,
			}),
		],
	});

	app.use(Sentry.Handlers.requestHandler());

	const RedisStore = redisConnect(session);

	app.set('trust proxy', true);
	app.use(
		helmet({
			contentSecurityPolicy: false,
		})
	);
	app.use(cors());

	const limiter = rateLimit({
		windowMs: 15 * 60 * 1000, // 15 minutes
		max: 100, // limit each IP to 100 requests per windowMs
	});
	app.use(limiter);

	app.use(
		session({
			store: new RedisStore({ client: redis.createClient({ keyPrefix: 'session:' }) }),
			secret: config.session_secret,
			resave: false,
			saveUninitialized: true,
			cookie: { secure: app.get('env') === 'production' },
		})
	);


	app.use(logger('dev'));
	//app.use(express.json());
	app.use(express.urlencoded({ extended: false }));
	app.use(cookieParser());

	app.get('/healthz', (req, res) => {
		res.send('ok');
	});

	app.use(compression({ threshold: 0 }))

	app.use(express.static(path.join(__dirname, 'public')));

	app.use('/oidc', oidcProviderRouter);

	app.use(
		sapper.middleware({
			session: async (req: Request, _: Response) => {

			},
		}),
	)
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
