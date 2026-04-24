/**
 * Course review loaders + mutators.
 *
 * Reads go through the same-origin `/api/reviews` proxy (public on the BE,
 * but proxy gives us a consistent surface). Writes require auth — the BE
 * scoped controller forces `author` to caller's user-profile and enforces
 * owner-only updates/deletes.
 */
import { fetcherClient, apiErrorMessage } from './fetcher';
import { normalizeReview } from './normalize';
import type { Review } from './types';

const LIST_QUERY =
  'populate[author][fields][0]=firstName' +
  '&populate[author][fields][1]=lastName' +
  '&populate[author][fields][2]=displayName' +
  '&pagination[pageSize]=100' +
  '&sort=createdAt:desc';

export async function fetchReviewsByCourse(courseDocumentId: string): Promise<Review[]> {
  const qs =
    LIST_QUERY +
    `&filters[course][documentId][$eq]=${encodeURIComponent(courseDocumentId)}`;
  const json = await fetcherClient<{ data?: unknown[] }>(`/api/reviews?${qs}`);
  const rows: unknown[] = Array.isArray(json?.data) ? json.data : [];
  return rows.map((r) => normalizeReview(r)).filter((r) => Boolean(r.documentId));
}

export interface CreateReviewInput {
  courseDocumentId: string;
  rating: number;
  title?: string;
  body?: string;
}

export async function createReview(input: CreateReviewInput): Promise<Review> {
  try {
    const json = await fetcherClient<{ data?: unknown }>(`/api/reviews`, {
      method: 'POST',
      body: {
        data: {
          course: input.courseDocumentId,
          rating: input.rating,
          title: input.title,
          body: input.body,
          publishedAt: new Date().toISOString(),
        },
      },
    });
    return normalizeReview(json?.data);
  } catch (e) {
    throw new Error(apiErrorMessage(e, 'Не вдалось зберегти відгук'));
  }
}

export interface UpdateReviewInput {
  rating?: number;
  title?: string;
  body?: string;
}

export async function updateReview(
  documentId: string,
  input: UpdateReviewInput,
): Promise<Review> {
  try {
    const json = await fetcherClient<{ data?: unknown }>(`/api/reviews/${documentId}`, {
      method: 'PUT',
      body: { data: input },
    });
    return normalizeReview(json?.data);
  } catch (e) {
    throw new Error(apiErrorMessage(e, 'Не вдалось оновити відгук'));
  }
}

export async function deleteReview(documentId: string): Promise<void> {
  try {
    await fetcherClient(`/api/reviews/${documentId}`, { method: 'DELETE' });
  } catch (e) {
    throw new Error(apiErrorMessage(e, 'Не вдалось видалити відгук'));
  }
}
