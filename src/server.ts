import express from 'express';
import { config } from './config'
import { setupPreMiddlewares, setupPostMiddlewares } from './startup';

const { PORT } = process.env;

const server = express();
setupPreMiddlewares(server);
setupPostMiddlewares(server);
server.listen(config.port, () => {
	console.log(`server listening port ${config.port}`);
});
