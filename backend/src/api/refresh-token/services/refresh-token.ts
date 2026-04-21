/**
 * refresh-token service.
 *
 * Handles issuance, rotation, reuse detection, and revocation of refresh tokens.
 * Raw token format: `<userProfileDocumentId>.<base64url-secret>`. Only the secret
 * portion is argon2id-hashed; the prefix lets the server narrow the DB lookup
 * to one user without requiring a separate lookup table.
 */
import { factories } from '@strapi/strapi';
import argon2 from 'argon2';
import crypto from 'crypto';

const UID = 'api::refresh-token.refresh-token';
const USER_PROFILE_UID = 'api::user-profile.user-profile';

const MAX_SESSIONS_PER_USER = 5;
const DEFAULT_TTL_DAYS = 30;
const SECRET_BYTES = 48;

type IssueCtx = { deviceId?: string; userAgent?: string; ip?: string };

function parseRawToken(raw: string) {
  const dot = raw.indexOf('.');
  if (dot <= 0 || dot === raw.length - 1) return null;
  return {
    userProfileDocumentId: raw.slice(0, dot),
    secret: raw.slice(dot + 1),
  };
}

async function capSessions(strapi: any, userProfileDocumentId: string) {
  const active = await strapi.documents(UID).findMany({
    filters: {
      user: { documentId: userProfileDocumentId },
      revokedAt: { $null: true },
    },
    sort: ['createdAt:asc'],
  });
  if (active.length < MAX_SESSIONS_PER_USER) return;

  const excess = active.slice(0, active.length - MAX_SESSIONS_PER_USER + 1);
  const now = new Date().toISOString();
  await Promise.all(
    excess.map((t: any) =>
      strapi.documents(UID).update({
        documentId: t.documentId,
        data: { revokedAt: now },
      })
    )
  );
}

async function issueInternal(
  strapi: any,
  userProfileDocumentId: string,
  c: IssueCtx
) {
  const secret = crypto.randomBytes(SECRET_BYTES).toString('base64url');
  const rawToken = `${userProfileDocumentId}.${secret}`;
  const tokenHash = await argon2.hash(secret, { type: argon2.argon2id });
  const expiresAt = new Date(Date.now() + DEFAULT_TTL_DAYS * 24 * 3600 * 1000);

  await capSessions(strapi, userProfileDocumentId);

  await strapi.documents(UID).create({
    data: {
      user: userProfileDocumentId,
      tokenHash,
      expiresAt: expiresAt.toISOString(),
      deviceId: c.deviceId,
      userAgent: c.userAgent,
      ip: c.ip,
    },
  });

  return { rawToken, expiresAt };
}

export default factories.createCoreService(UID, ({ strapi }) => ({
  async issueForProfile(userProfileDocumentId: string, c: IssueCtx = {}) {
    return issueInternal(strapi, userProfileDocumentId, c);
  },

  async rotate(rawToken: string, c: IssueCtx = {}) {
    const parsed = parseRawToken(rawToken);
    if (!parsed) return { ok: false as const, reason: 'malformed' as const };

    const candidates = await strapi.documents(UID).findMany({
      filters: { user: { documentId: parsed.userProfileDocumentId } },
      populate: { user: true },
    });
    if (candidates.length === 0) {
      return { ok: false as const, reason: 'not-found' as const };
    }

    const now = Date.now();
    const isActive = (t: any) =>
      !t.revokedAt && new Date(t.expiresAt).getTime() > now;

    let match: any = null;
    for (const t of candidates) {
      if (!isActive(t)) continue;
      if (await argon2.verify(t.tokenHash, parsed.secret)) {
        match = t;
        break;
      }
    }

    if (!match) {
      for (const t of candidates) {
        if (isActive(t)) continue;
        if (await argon2.verify(t.tokenHash, parsed.secret)) {
          await revokeAllInternal(strapi, parsed.userProfileDocumentId);
          strapi.log.warn(
            `refresh-token reuse detected for user-profile ${parsed.userProfileDocumentId}`
          );
          return { ok: false as const, reason: 'reuse' as const };
        }
      }
      return { ok: false as const, reason: 'not-found' as const };
    }

    const now2 = new Date().toISOString();
    await strapi.documents(UID).update({
      documentId: match.documentId,
      data: { revokedAt: now2, lastUsedAt: now2 },
    });

    const issued = await issueInternal(strapi, parsed.userProfileDocumentId, c);
    return {
      ok: true as const,
      rawToken: issued.rawToken,
      expiresAt: issued.expiresAt,
      userProfileDocumentId: parsed.userProfileDocumentId,
    };
  },

  async revoke(rawToken: string) {
    const parsed = parseRawToken(rawToken);
    if (!parsed) return false;
    const candidates = await strapi.documents(UID).findMany({
      filters: {
        user: { documentId: parsed.userProfileDocumentId },
        revokedAt: { $null: true },
      },
    });
    for (const t of candidates) {
      if (await argon2.verify(t.tokenHash, parsed.secret)) {
        await strapi.documents(UID).update({
          documentId: t.documentId,
          data: { revokedAt: new Date().toISOString() },
        });
        return true;
      }
    }
    return false;
  },

  async revokeAllForUser(userProfileDocumentId: string) {
    return revokeAllInternal(strapi, userProfileDocumentId);
  },
}));

async function revokeAllInternal(strapi: any, userProfileDocumentId: string) {
  const tokens = await strapi.documents(UID).findMany({
    filters: {
      user: { documentId: userProfileDocumentId },
      revokedAt: { $null: true },
    },
  });
  const now = new Date().toISOString();
  await Promise.all(
    tokens.map((t: any) =>
      strapi.documents(UID).update({
        documentId: t.documentId,
        data: { revokedAt: now },
      })
    )
  );
  const profile = await strapi.documents(USER_PROFILE_UID).findOne({
    documentId: userProfileDocumentId,
  });
  await strapi.documents(USER_PROFILE_UID).update({
    documentId: userProfileDocumentId,
    data: { tokenVersion: ((profile as any)?.tokenVersion ?? 0) + 1 },
  });
}
