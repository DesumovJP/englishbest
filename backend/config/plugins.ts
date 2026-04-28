/**
 * Strapi plugin configuration.
 *
 * - users-permissions: short-lived JWT (15m default) — refresh-token rotation
 *   handles long-lived sessions.
 * - upload: switches between Strapi's local-disk provider (dev) and DigitalOcean
 *   Spaces (prod) based on `DO_SPACE_BUCKET` presence. The S3-compatible
 *   provider package `@strapi/provider-upload-aws-s3` is configured exactly the
 *   same way our CoffeePOS service does, so the same Railway env-var names
 *   transfer 1:1.
 *
 * Required prod env vars (Railway → backend service):
 *   DO_SPACE_KEY        — DO Spaces access key id
 *   DO_SPACE_SECRET     — DO Spaces secret key
 *   DO_SPACE_ENDPOINT   — e.g. https://fra1.digitaloceanspaces.com
 *   DO_SPACE_REGION     — e.g. fra1 (default if unset)
 *   DO_SPACE_BUCKET     — e.g. englishbest-media
 *   DO_SPACE_CDN        — e.g. https://englishbest-media.fra1.cdn.digitaloceanspaces.com
 *   DO_SPACE_ROOT_PATH  — folder prefix inside the bucket (default: 'englishbest')
 *
 * In local dev these stay unset → provider falls back to `local` (Strapi's
 * built-in disk store under `public/uploads`).
 */
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
  upload: {
    config: {
      provider: env('DO_SPACE_BUCKET') ? '@strapi/provider-upload-aws-s3' : 'local',
      providerOptions: env('DO_SPACE_BUCKET')
        ? {
            s3Options: {
              credentials: {
                accessKeyId: env('DO_SPACE_KEY'),
                secretAccessKey: env('DO_SPACE_SECRET'),
              },
              endpoint: env('DO_SPACE_ENDPOINT'),
              region: env('DO_SPACE_REGION', 'fra1'),
              forcePathStyle: false,
              params: {
                Bucket: env('DO_SPACE_BUCKET'),
                ACL: 'public-read',
              },
            },
            baseUrl: env(
              'DO_SPACE_CDN',
              `${env('DO_SPACE_ENDPOINT')}/${env('DO_SPACE_BUCKET')}`,
            ),
            rootPath: env('DO_SPACE_ROOT_PATH', 'englishbest'),
          }
        : {},
      actionOptions: {
        upload: {},
        uploadStream: {},
        delete: {},
      },
    },
  },
});

export default config;
