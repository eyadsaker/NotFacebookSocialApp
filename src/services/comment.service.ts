import { api } from "./api";
import type { ApiResponse } from "../interface/ApiResponse";
import type { Comment } from "../interface/comment";

export async function getComments(postId: string, page: number) {
  const { data } = await api.get<ApiResponse<{ comments: Comment[] }>>(`/posts/${postId}/comments`, { params: { page, limit: 10 } });
  return data;
}

export async function saveComment({ postId, id, content }: { postId: string; id?: string; content: string }) {
  const form = new FormData();
  form.append("content", content);
  const path = `/posts/${postId}/comments`;
  return id ? api.put(`${path}/${id}`, form) : api.post(path, form);
}

export async function deleteComment({ postId, id }: { postId: string; id: string }) {
  await api.delete(`/posts/${postId}/comments/${id}`);
}
