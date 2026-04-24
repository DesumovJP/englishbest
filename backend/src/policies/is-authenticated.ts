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

  const route = policyContext.request?.url ?? '<unknown>';
  const authHeader = policyContext.request?.header?.authorization ? 'present' : 'missing';
  strapi.log.warn(`[is-authenticated] deny — url=${route} auth-header=${authHeader}`);
  return false;
};
