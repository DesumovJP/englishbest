// TODO: replace mock URLs with Strapi endpoints when integrating

export async function fetchCourses() {
  return fetch('/api/mock/courses').then(res => res.json());
}

export async function fetchCourseBySlug(courseSlug: string) {
  return fetch(`/api/mock/courses?slug=${encodeURIComponent(courseSlug)}`).then(res => res.json());
}

export async function fetchLesson(courseSlug: string, lessonSlug: string) {
  return fetch(
    `/api/mock/lessons?courseSlug=${encodeURIComponent(courseSlug)}&lessonSlug=${encodeURIComponent(lessonSlug)}`
  ).then(res => res.json());
}

export async function fetchLessonsByCourse(courseSlug: string) {
  return fetch(`/api/mock/lessons?courseSlug=${encodeURIComponent(courseSlug)}`).then(res => res.json());
}

export async function fetchUserBySlug(userSlug: string) {
  return fetch(`/api/mock/users?userSlug=${encodeURIComponent(userSlug)}`).then(res => res.json());
}

export async function postProgress(
  userSlug: string,
  payload: { lessonSlug: string; status: string; documentId?: string }
) {
  return fetch(`/api/mock/users/${encodeURIComponent(userSlug)}/progress`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }).then(r => r.json());
}

export async function fetchCalendar(userSlug: string) {
  return fetch(`/api/mock/calendar?userSlug=${encodeURIComponent(userSlug)}`).then(res => res.json());
}

export async function fetchQuizData() {
  return fetch('/api/mock/quiz').then(res => res.json());
}
