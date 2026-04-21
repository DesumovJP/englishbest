/**
 * `has-role` policy.
 *
 * Allows the request only if the authenticated user's role matches one of the allowed roles.
 *
 * Usage:
 *   policies: [
 *     'global::is-authenticated',
 *     { name: 'global::has-role', config: { roles: ['teacher', 'admin'] } }
 *   ]
 *
 * Role matching is case-insensitive and works against the Strapi role `type` or `name`.
 */
export default (policyContext, config: { roles?: string[] }, { strapi }) => {
  const user = policyContext.state.user;
  if (!user) return false;

  const allowed = (config?.roles ?? []).map((r) => r.toLowerCase());
  if (allowed.length === 0) {
    strapi.log.warn('has-role: no roles configured — denying');
    return false;
  }

  const role = user.role?.type?.toLowerCase() ?? user.role?.name?.toLowerCase();
  if (!role) return false;

  return allowed.includes(role);
};
