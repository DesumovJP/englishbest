/**
 * `is-organization-member` policy.
 *
 * Tenant guard. Loads the target entity and verifies that its `organization`
 * matches the caller's `user-profile.organization`.
 *
 * Usage:
 *   policies: [
 *     'global::is-authenticated',
 *     { name: 'global::is-organization-member', config: { uid: 'api::group.group' } }
 *   ]
 *
 * Config:
 *   - uid: content-type UID of the target entity. Required.
 *   - param: route param with entity id/documentId (default: 'id').
 *   - orgField: relation field on the entity (default: 'organization').
 */
export default async (
  policyContext,
  config: { uid: string; param?: string; orgField?: string },
  { strapi }
) => {
  const user = policyContext.state.user;
  if (!user) return false;

  const uid = config?.uid;
  if (!uid) {
    strapi.log.warn('is-organization-member: missing `uid` — denying');
    return false;
  }

  const param = config.param ?? 'id';
  const orgField = config.orgField ?? 'organization';

  const key = policyContext.params?.[param];
  if (!key) return false;

  const [profile] = await strapi.documents('api::user-profile.user-profile').findMany({
    filters: { user: { id: user.id } },
    populate: { organization: true },
    limit: 1,
  });

  const callerOrgId = profile?.organization?.id;
  if (!callerOrgId) return false;

  const entity = await strapi.documents(uid as any).findOne({
    documentId: key,
    populate: { [orgField]: true },
  });

  if (!entity) return false;

  return entity[orgField]?.id === callerOrgId;
};
