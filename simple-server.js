import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const app = require('./simple-server.cjs');
export default app;
