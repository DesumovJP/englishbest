/**
 * Global `audit-log` middleware.
 *
 * Writes an `api::audit-log.audit-log` row for security-relevant mutations
 * under `/api/...`. Append-only by design — rows are never updated or deleted.
 *
 * Scope:
 *   - Methods: POST, PUT, PATCH, DELETE
 *   - Paths:   /api/** matching the AUDITED_PATHS prefix list
 *   - Skips:   non-2xx responses, and the audit-log resource itself (to avoid recursion)
 *
 * Registered in config/middlewares.ts as `global::audit-log`.
 */
import crypto from 'crypto';

const AUDIT_UID = 'api::audit-log.audit-log';
const USER_PROFILE_UID = 'api::user-profile.user-profile';

const AUDITED_PATHS = [
  '/api/auth/',
  '/api/user-profiles',
  '/api/organizations',
  '/api/refresh-tokens',
  '/api/consent-logs',
  '/api/parent-links',
  '/api/kids-profiles',
  '/api/adult-profiles',
  '/api/teacher-profiles',
  '/api/parent-profiles',
  '/api/admin-profiles',
];

const MUTATION_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

const SENSITIVE_KEYS = new Set([
  'password',
  'currentPassword',
  'newPassword',
  'token',
  'tokenHash',
  'refreshToken',
  'accessToken',
  'pinHash',
  'pin',
  'resetPasswordToken',
  'confirmationToken',
]);

function redact(value: any, depth = 0): any {
  if (value == null || depth > 5) return value;
  if (Array.isArray(value)) return value.map((v) => redact(v, depth + 1));
  if (typeof value === 'object') {
    const out: Record<string, any> = {};
    for (const [k, v] of Object.entries(value)) {
      out[k] = SENSITIVE_KEYS.has(k) ? '[REDACTED]' : redact(v, depth + 1);
    }
    return out;
  }
  return value;
}

function isAudited(ctx: any) {
  if (!MUTATION_METHODS.has(ctx.method)) return false;
  const path = ctx.path as string;
  if (!path) return false;
  if (path.startsWith('/api/audit-logs')) return false;
  return AUDITED_PATHS.some((p) => path === p || path.startsWith(p));
}

function deriveEntityType(path: string) {
  // /api/refresh-tokens/abc → refresh-tokens
  // /api/auth/refresh → auth/refresh
  const m = path.match(/^\/api\/([^/]+)(?:\/([^/]+))?/);
  if (!m) return path;
  if (m[1] === 'auth' && m[2]) return `auth/${m[2]}`;
  return m[1];
}

function deriveEntityId(ctx: any) {
  if (ctx.params?.id) return String(ctx.params.id);
  const body: any = ctx.body;
  if (body?.data?.documentId) return String(body.data.documentId);
  if (body?.data?.id) return String(body.data.id);
  return 'n/a';
}

function deriveAction(ctx: any) {
  const path = ctx.path as string;
  if (path.startsWith('/api/auth/')) {
    return path.replace('/api/', '').replace(/\//g, ':');
  }
  const base = deriveEntityType(path);
  switch (ctx.method) {
    case 'POST':
      return `${base}:create`;
    case 'PUT':
    case 'PATCH':
      return `${base}:update`;
    case 'DELETE':
      return `${base}:delete`;
    default:
      return `${base}:${ctx.method.toLowerCase()}`;
  }
}

export default (_config: unknown, { strapi }: { strapi: any }) => {
  return async (ctx: any, next: () => Promise<void>) => {
    const requestId =
      (ctx.request.headers['x-request-id'] as string | undefined) ||
      crypto.randomUUID();
    ctx.state.requestId = requestId;
    ctx.set('x-request-id', requestId);

    await next();

    if (ctx.status < 200 || ctx.status >= 300) return;
    if (!isAudited(ctx)) return;

    try {
      let actorProfileDocId: string | undefined;
      const user = ctx.state.user;
      if (user?.id) {
        const [profile] = await strapi.documents(USER_PROFILE_UID).findMany({
          filters: { user: { id: user.id } },
          limit: 1,
        });
        actorProfileDocId = profile?.documentId;
      }

      const afterRaw = ctx.body?.data ?? ctx.body;
      const after = afterRaw ? redact(afterRaw) : null;

      await strapi.documents(AUDIT_UID).create({
        data: {
          actor: actorProfileDocId,
          actorIp: ctx.request.ip ?? null,
          actorUserAgent:
            (ctx.request.headers['user-agent'] as string | undefined) ?? null,
          action: deriveAction(ctx),
          entityType: deriveEntityType(ctx.path),
          entityId: deriveEntityId(ctx),
          after,
          requestId,
          statusCode: ctx.status,
        },
      });
    } catch (err) {
      strapi.log.error('audit-log middleware: failed to write record', err);
    }
  };
};
