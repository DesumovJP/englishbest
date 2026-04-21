/**
 * `is-authenticated` policy.
 *
 * Allows the request only if a user is attached to ctx.state.
 * Attach via route config: `policies: ['global::is-authenticated']`.
 */
export default (policyContext, _config, { strapi }) => {
  if (policyContext.state.user) {
    return true;
  }

  strapi.log.debug('is-authenticated: no user on ctx.state — denying');
  return false;
};
