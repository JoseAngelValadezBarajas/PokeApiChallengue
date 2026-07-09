import { env } from './shared/config/env.js';
import { buildServer } from './server.js';

const app = await buildServer({ startBackgroundSync: true });

try {
  await app.listen({ port: env.PORT, host: '0.0.0.0' });
} catch (error) {
  app.log.error(error);
  process.exit(1);
}
