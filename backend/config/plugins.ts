import type { Core } from '@strapi/strapi';

const config = ({ env }: Core.Config.Shared.ConfigParams): Core.Config.Plugin => ({
  'users-permissions': {
    config: {
      jwtSecret: env('JWT_SECRET'),
      // Short-lived access tokens; refresh rotation handles long-lived sessions.
      // Overridable per-env (e.g. relax to 1h in staging for easier debugging).
      jwt: {
        expiresIn: env('JWT_EXPIRES_IN', '15m'),
      },
    },
  },
});

export default config;
