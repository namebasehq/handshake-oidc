import express from 'express';

import { setupPreMiddlewares, setupPostMiddlewares } from './startup';

const { PORT } = process.env;

const server = express();
setupPreMiddlewares(server);
setupPostMiddlewares(server);
server.listen(PORT, () => {
	console.log(`server listening port ${PORT}`);
});
