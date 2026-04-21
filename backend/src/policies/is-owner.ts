/**
 * `is-owner` policy (generic).
 *
 * Loads the entity referenced by the route :id param and checks that
 * the entity's owner (`user` relation by default) matches ctx.state.user.
 *
 * Usage:
 *   policies: [
 *     'global::is-authenticated',
 *     { name: 'global::is-owner', config: { uid: 'api::refresh-token.refresh-token' } }
 *   ]
 *
 * Config:
 *   - uid: Strapi content-type UID. Required.
 *   - param: route param holding the entity id/documentId (default: 'id').
 *   - ownerField: relation field pointing to the owner user (default: 'user').
 *   - ownerIdPath: 'id' or 'documentId' on the owner (default: 'id').
 */
export default async (
  policyContext,
  config: {
    uid: string;
    param?: string;
    ownerField?: string;
    ownerIdPath?: 'id' | 'documentId';
  },
  { strapi }
) => {
  const user = policyContext.state.user;
  if (!user) return false;

  const uid = config?.uid;
  if (!uid) {
    strapi.log.warn('is-owner: missing `uid` in config — denying');
    return false;
  }

  const param = config.param ?? 'id';
  const ownerField = config.ownerField ?? 'user';
  const ownerIdPath = config.ownerIdPath ?? 'id';

  const key = policyContext.params?.[param];
  if (!key) return false;

  const entity = await strapi.documents(uid as any).findOne({
    documentId: key,
    populate: { [ownerField]: true },
  });

  if (!entity) return false;

  const owner = entity[ownerField];
  if (!owner) return false;

  return owner[ownerIdPath] === user[ownerIdPath];
};
