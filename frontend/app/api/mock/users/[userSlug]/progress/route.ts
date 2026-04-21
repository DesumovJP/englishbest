import type { NextRequest } from 'next/server';

export async function POST(
  request: NextRequest,
  ctx: { params: Promise<{ userSlug: string }> }
) {
  const { userSlug } = await ctx.params;
  const body = await request.json();
  // TODO: In production, persist to Strapi/Postgres
  return Response.json({ success: true, userSlug, ...body });
}
