/**
 * API Service — All frontend API calls to the backend
 * Updated for new schema: Solve has problem.title/url instead of problemName/link
 */
import { api } from "../axios";

/* ─── Types ─── */

/** Solve with joined Problem details from the new schema */
export type Solve = {
  id: string;
  userId: string;
  problemId: string;
  solvedAt: string;
  problem: {
    id: string;
    title: string;
    url: string;
    externalId: string;
    difficulty: string | null;
    platform: { name: string };
  };
};

export type ReviseResponse = {
  error?: string;
  success?: boolean;
  previousDay: Solve[];
  previousWeek: Solve[];
  previousMonth: Solve[];
};

export type StatsSummary = {
  totalSolves: number;
  todayHours: number;
  streak: number;
};

export type PostPreview = {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  author: {
    id: string;
    email: string;
    handle?: string | null;
  };
  tags: { tag: { id: number; name: string } }[];
  _count: { likes: number; comments: number };
};

export type PostListResponse = {
  posts: PostPreview[];
  total: number;
  page: number;
  totalPages: number;
};

/* ─── Revision ─── */

/** Fetch spaced repetition revision solves */
export async function getRevisionSolves(): Promise<ReviseResponse> {
  const res = await api.get<ReviseResponse>("/api/revise");
  if (res.data.error) throw new Error(res.data.error);
  return res.data;
}

/* ─── Stats ─── */

/** Fetch stats summary: total solves, today's solves, streak */
export async function getStatsSummary(): Promise<StatsSummary> {
  const res = await api.get<StatsSummary>("/api/stats/summary");
  return res.data;
}

/* ─── Posts (Blog/Discussion) ─── */

/** Fetch paginated posts */
export async function getPosts(
  page: number = 1,
  limit: number = 10,
  search?: string
): Promise<PostListResponse> {
  const params: Record<string, string | number> = { page, limit };
  if (search) params.search = search;
  const res = await api.get("/api/posts", { params });
  return res.data;
}

/** Fetch a single post with comments */
export async function getPost(postId: string) {
  const res = await api.get(`/api/posts/${postId}`);
  return res.data;
}

/** Create a new post */
export async function createPost(data: {
  title: string;
  content: string;
  tags?: string[];
}) {
  const res = await api.post("/api/posts", data);
  return res.data;
}

/** Toggle like on a post */
export async function likePost(postId: string) {
  const res = await api.post(`/api/posts/${postId}/like`);
  return res.data;
}

/** Add a comment to a post */
export async function createComment(
  postId: string,
  content: string,
  parentId?: string
) {
  const res = await api.post(`/api/posts/${postId}/comments`, {
    content,
    parentId,
  });
  return res.data;
}

/** Toggle like on a comment */
export async function likeComment(commentId: string) {
  const res = await api.post(`/api/comments/${commentId}/like`);
  return res.data;
}

/* ─── AI Chat ─── */

/** Send a message to the AI chatbot */
export async function sendChatMessage(
  message: string,
  history: { role: string; content: string }[] = []
): Promise<string> {
  const res = await api.post<{ reply: string }>("/api/chat", {
    message,
    history,
  });
  return res.data.reply;
}
