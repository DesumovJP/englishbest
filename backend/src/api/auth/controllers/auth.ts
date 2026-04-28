/**
 * auth controller.
 *
 * Custom endpoints complementing `users-permissions` stock login. This is the
 * single entry point the frontend uses — no direct hits to `/auth/local/*` —
 * so that user + user-profile + role-profile stay in sync and refresh tokens
 * are minted alongside the access JWT.
 *
 *   POST /api/auth/register    — create user + user-profile + role-profile + tokens
 *   POST /api/auth/login       — credentials → access JWT + refresh token
 *   POST /api/auth/refresh     — rotate refresh token, returns new access + refresh
 *   POST /api/auth/logout      — revoke a single refresh token (current device)
 *   POST /api/auth/logout-all  — revoke all refresh tokens for the user
 *   GET  /api/auth/me          — current session (user + profile + role-profile)
 */
const REFRESH_TOKEN_UID = 'api::refresh-token.refresh-token';
const USER_PROFILE_UID = 'api::user-profile.user-profile';
const USERS_PERMISSIONS_USER_UID = 'plugin::users-permissions.user';
const USERS_PERMISSIONS_ROLE_UID = 'plugin::users-permissions.role';

type AppRole = 'kids' | 'adult' | 'teacher' | 'parent' | 'admin';
const APP_ROLES: readonly AppRole[] = ['kids', 'adult', 'teacher', 'parent', 'admin'];

const ROLE_PROFILE_UID: Record<AppRole, string> = {
  kids: 'api::kids-profile.kids-profile',
  adult: 'api::adult-profile.adult-profile',
  teacher: 'api::teacher-profile.teacher-profile',
  parent: 'api::parent-profile.parent-profile',
  admin: 'api::admin-profile.admin-profile',
};

function extractRequestContext(ctx: any) {
  const headers = ctx.request.headers ?? {};
  return {
    deviceId: (headers['x-device-id'] as string | undefined) || undefined,
    userAgent: (headers['user-agent'] as string | undefined) || undefined,
    ip: ctx.request.ip || undefined,
  };
}

function sanitizeUser(user: any) {
  if (!user) return null;
  const { password, resetPasswordToken, confirmationToken, ...safe } = user;
  return safe;
}

async function issueTokenPair(strapi: any, userProfile: any, authUser: any, reqCtx: any) {
  const accessToken = strapi
    .plugin('users-permissions')
    .service('jwt')
    .issue({ id: authUser.id });

  const refresh = await (strapi.service(REFRESH_TOKEN_UID) as any).issueForProfile(
    userProfile.documentId,
    reqCtx
  );

  return {
    accessToken,
    refreshToken: refresh.rawToken,
    refreshExpiresAt: refresh.expiresAt,
  };
}

async function loadSession(strapi: any, authUserId: number | string) {
  const [profile] = await strapi.documents(USER_PROFILE_UID).findMany({
    filters: { user: { id: authUserId } },
    populate: {
      user: { populate: { role: true } },
      organization: true,
      avatar: { fields: ['url'] },
      kidsProfile: true,
      adultProfile: true,
      teacherProfile: true,
      parentProfile: true,
      adminProfile: true,
    },
    limit: 1,
  });
  if (!profile) return null;
  // Flatten the populated avatar to a top-level `avatarUrl` so every FE
  // consumer (sidebar, dashboard cards, etc.) reads one consistent path
  // — `session.profile.avatarUrl` — instead of digging into the nested
  // `avatar` relation. The DO Spaces upload provider returns absolute
  // CDN URLs; the local-disk dev provider returns relative `/uploads/...`
  // which the FE absolutizes via `lib/normalize.mediaUrl`.
  const avatarUrl =
    typeof (profile as { avatar?: { url?: unknown } }).avatar?.url === 'string'
      ? ((profile as { avatar: { url: string } }).avatar.url as string)
      : null;
  return { ...(profile as Record<string, unknown>), avatarUrl };
}

// Build the role-profile payload from registration input. Kept narrow — only
// the fields the schema requires + a handful of common ones. The rest is
// filled in later via the profile-edit UI.
function buildRoleProfileData(role: AppRole, input: any): Record<string, unknown> {
  switch (role) {
    case 'kids':
      return {
        companionAnimal: input.companionAnimal ?? 'fox',
        companionName: input.companionName ?? 'Friend',
        ageGroup: input.ageGroup,
      };
    case 'adult':
      return {
        goal: input.goal,
        currentLevel: input.currentLevel,
        targetLevel: input.targetLevel,
      };
    case 'teacher':
      return {
        bio: input.bio,
        publicSlug: input.publicSlug,
        yearsExperience: input.yearsExperience,
      };
    case 'parent':
      return {};
    case 'admin':
      return {};
  }
}

export default {
  async register(ctx: any) {
    const body = ctx.request.body ?? {};
    const { email, password, username, role, firstName, lastName, displayName } = body;

    if (!email || !password) return ctx.badRequest('email and password required');
    if (!role || !APP_ROLES.includes(role)) return ctx.badRequest('invalid role');
    if (!firstName) return ctx.badRequest('firstName required');
    if (role === 'kids' && !body.companionAnimal) {
      return ctx.badRequest('companionAnimal required for kids role');
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const existing = await strapi.db
      .query(USERS_PERMISSIONS_USER_UID)
      .findOne({ where: { email: normalizedEmail } });
    if (existing) {
      ctx.status = 409;
      ctx.body = { error: { status: 409, name: 'ConflictError', message: 'email already registered' } };
      return;
    }

    const upRole = await strapi.db
      .query(USERS_PERMISSIONS_ROLE_UID)
      .findOne({ where: { type: role } });
    if (!upRole) return ctx.badRequest(`role '${role}' not configured`);

    let createdUser: any = null;
    let createdProfile: any = null;
    let createdRoleProfile: any = null;

    try {
      createdUser = await strapi.plugin('users-permissions').service('user').add({
        email: normalizedEmail,
        username: username || normalizedEmail,
        password,
        confirmed: true,
        blocked: false,
        provider: 'local',
        role: upRole.id,
      });

      createdProfile = await strapi.documents(USER_PROFILE_UID).create({
        data: {
          user: createdUser.id,
          role,
          firstName,
          lastName,
          displayName: displayName ?? firstName,
          locale: body.locale,
          timezone: body.timezone,
          dateOfBirth: body.dateOfBirth,
          phone: body.phone,
          organization: body.organizationId,
          consentTermsAt: new Date().toISOString(),
          consentPrivacyAt: new Date().toISOString(),
          marketingOptIn: Boolean(body.marketingOptIn),
        },
      });

      createdRoleProfile = await (strapi as any)
        .documents(ROLE_PROFILE_UID[role as AppRole])
        .create({
          data: {
            user: createdProfile.documentId,
            ...buildRoleProfileData(role, body),
          },
        });

      const tokens = await issueTokenPair(
        strapi,
        createdProfile,
        createdUser,
        extractRequestContext(ctx)
      );
      const session = await loadSession(strapi, createdUser.id);

      ctx.status = 201;
      ctx.body = {
        ...tokens,
        user: sanitizeUser(createdUser),
        profile: session,
      };
    } catch (err) {
      strapi.log.error('[auth.register] failed, rolling back');
      strapi.log.error(err as any);
      if (createdRoleProfile?.documentId) {
        await (strapi as any)
          .documents(ROLE_PROFILE_UID[role as AppRole])
          .delete({ documentId: createdRoleProfile.documentId })
          .catch(() => {});
      }
      if (createdProfile?.documentId) {
        await strapi
          .documents(USER_PROFILE_UID)
          .delete({ documentId: createdProfile.documentId })
          .catch(() => {});
      }
      if (createdUser?.id) {
        await strapi.db
          .query(USERS_PERMISSIONS_USER_UID)
          .delete({ where: { id: createdUser.id } })
          .catch(() => {});
      }
      ctx.status = 500;
      ctx.body = { error: { status: 500, name: 'InternalServerError', message: 'registration failed' } };
      return;
    }
  },

  async login(ctx: any) {
    const body = ctx.request.body ?? {};
    const { identifier, password } = body;
    if (!identifier || !password) return ctx.badRequest('identifier and password required');

    const user = await strapi.db.query(USERS_PERMISSIONS_USER_UID).findOne({
      where: {
        provider: 'local',
        $or: [{ email: String(identifier).toLowerCase() }, { username: identifier }],
      },
    });
    if (!user || !user.password) return ctx.unauthorized('invalid credentials');
    if (user.blocked) return ctx.forbidden('account blocked');

    const valid = await strapi
      .plugin('users-permissions')
      .service('user')
      .validatePassword(password, user.password);
    if (!valid) return ctx.unauthorized('invalid credentials');

    const [profile] = await strapi.documents(USER_PROFILE_UID).findMany({
      filters: { user: { id: user.id } },
      limit: 1,
    });
    if (!profile) return ctx.forbidden('no user-profile for this user');
    if ((profile as any).status === 'deleted') return ctx.forbidden('account deleted');

    const tokens = await issueTokenPair(strapi, profile, user, extractRequestContext(ctx));
    const session = await loadSession(strapi, user.id);

    ctx.body = {
      ...tokens,
      user: sanitizeUser(user),
      profile: session,
    };
  },

  async me(ctx: any) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();

    const session = await loadSession(strapi, user.id);
    if (!session) return ctx.notFound('profile not found');

    ctx.body = {
      user: sanitizeUser(user),
      profile: session,
    };
  },

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

    const accessToken = strapi
      .plugin('users-permissions')
      .service('jwt')
      .issue({ id: authUser.id });

    ctx.body = {
      accessToken,
      refreshToken: result.rawToken,
      refreshExpiresAt: result.expiresAt,
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
