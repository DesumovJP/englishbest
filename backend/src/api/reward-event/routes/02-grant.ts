/**
 * Custom rewards routes.
 *
 * - POST /rewards/grant — teacher / admin manually awards bonus coins
 *   (and optionally XP) to a single student. Routes through
 *   `lib/rewards.ts:awardOnAction({ action:'grant' })` so the bonus credit
 *   is indistinguishable from any other reward, plus `meta.grantedBy`
 *   carries the actor for audit.
 * - GET /rewards/student/:studentId/motivation — aggregate snapshot
 *   (level, streak, total coins/xp, recent achievements + events) for
 *   the StudentDetail "motivation" tab. Scoped per role inside the
 *   controller.
 */
export default {
  routes: [
    {
      method: 'POST',
      path: '/rewards/grant',
      handler: 'api::reward-event.reward-event.grant',
      config: { policies: ['global::is-authenticated'] },
    },
    {
      method: 'GET',
      path: '/rewards/student/:studentId/motivation',
      handler: 'api::reward-event.reward-event.motivationSummary',
      config: { policies: ['global::is-authenticated'] },
    },
  ],
};
