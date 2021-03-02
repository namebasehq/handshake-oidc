import express from 'express';
import { port } from './config';
import { setupPostMiddlewares, setupPreMiddlewares } from './startup';

const server = express();
setupPreMiddlewares(server);
setupPostMiddlewares(server);
server.listen(port, () => {
	console.log(`server listening port ${port}`);
});
