import { API_BASE_URL } from "./config";
import { fetcher } from "./fetcher";

const qs = (params: Record<string, string>) =>
  new URLSearchParams(params).toString();

export function fetchCourses<T = unknown>(): Promise<T> {
  return fetcher<T>(`${API_BASE_URL}/courses`);
}

export function fetchCourseBySlug<T = unknown>(courseSlug: string): Promise<T> {
  return fetcher<T>(`${API_BASE_URL}/courses?${qs({ slug: courseSlug })}`);
}

export function fetchLesson<T = unknown>(
  courseSlug: string,
  lessonSlug: string,
): Promise<T> {
  return fetcher<T>(
    `${API_BASE_URL}/lessons?${qs({ courseSlug, lessonSlug })}`,
  );
}

export function fetchLessonsByCourse<T = unknown>(
  courseSlug: string,
): Promise<T> {
  return fetcher<T>(`${API_BASE_URL}/lessons?${qs({ courseSlug })}`);
}

export function fetchUserBySlug<T = unknown>(userSlug: string): Promise<T> {
  return fetcher<T>(`${API_BASE_URL}/users?${qs({ userSlug })}`);
}

export async function postProgress<T = unknown>(
  userSlug: string,
  payload: { lessonSlug: string; status: string; documentId?: string },
): Promise<T> {
  const res = await fetch(
    `${API_BASE_URL}/users/${encodeURIComponent(userSlug)}/progress`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
  );
  if (!res.ok) throw new Error(`postProgress failed: ${res.status}`);
  return res.json() as Promise<T>;
}

export function fetchCalendar<T = unknown>(userSlug: string): Promise<T> {
  return fetcher<T>(`${API_BASE_URL}/calendar?${qs({ userSlug })}`);
}

export function fetchQuizData<T = unknown>(): Promise<T> {
  return fetcher<T>(`${API_BASE_URL}/quiz`);
}
