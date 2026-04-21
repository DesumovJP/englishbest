/**
 * auth controller.
 *
 * Custom endpoints complementing `users-permissions` stock login:
 *   POST /api/auth/refresh     — rotate a refresh token, returns new access + refresh
 *   POST /api/auth/logout      — revoke a single refresh token (current device)
 *   POST /api/auth/logout-all  — revoke all refresh tokens for the user, bump tokenVersion
 */
const REFRESH_TOKEN_UID = 'api::refresh-token.refresh-token';
const USER_PROFILE_UID = 'api::user-profile.user-profile';

function extractRequestContext(ctx: any) {
  const headers = ctx.request.headers ?? {};
  return {
    deviceId: (headers['x-device-id'] as string | undefined) || undefined,
    userAgent: (headers['user-agent'] as string | undefined) || undefined,
    ip: ctx.request.ip || undefined,
  };
}

export default {
  async refresh(ctx: any) {
    const body = ctx.request.body ?? {};
    const refreshToken =
      typeof body.refreshToken === 'string' ? body.refreshToken : null;

    if (!refreshToken) return ctx.badRequest('refreshToken required');

    const svc = strapi.service(REFRESH_TOKEN_UID) as any;
    const reqCtx = extractRequestContext(ctx);
    const result = await svc.rotate(refreshToken, reqCtx);

    if (!result.ok) {
      if (result.reason === 'reuse') {
        return ctx.unauthorized('refresh token reuse detected');
      }
      return ctx.unauthorized('invalid refresh token');
    }

    const profile = await strapi.documents(USER_PROFILE_UID).findOne({
      documentId: result.userProfileDocumentId,
      populate: { user: true },
    });
    const authUser = (profile as any)?.user;
    if (!authUser) return ctx.unauthorized('user not found');

    const jwt = strapi
      .plugin('users-permissions')
      .service('jwt')
      .issue({ id: authUser.id });

    ctx.body = {
      accessToken: jwt,
      refreshToken: result.rawToken,
      expiresAt: result.expiresAt,
    };
  },

  async logout(ctx: any) {
    const body = ctx.request.body ?? {};
    const refreshToken =
      typeof body.refreshToken === 'string' ? body.refreshToken : null;
    if (!refreshToken) return ctx.badRequest('refreshToken required');

    const svc = strapi.service(REFRESH_TOKEN_UID) as any;
    await svc.revoke(refreshToken);
    ctx.status = 204;
  },

  async logoutAll(ctx: any) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();

    const [profile] = await strapi.documents(USER_PROFILE_UID).findMany({
      filters: { user: { id: user.id } },
      limit: 1,
    });
    if (!profile) return ctx.notFound('profile not found');

    const svc = strapi.service(REFRESH_TOKEN_UID) as any;
    await svc.revokeAllForUser(profile.documentId);
    ctx.status = 204;
  },
};
