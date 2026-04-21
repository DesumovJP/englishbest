import { mockQuiz } from '@/lib/mockClient';

export async function GET() {
  return Response.json(mockQuiz);
}
