import { api } from "./api";
import type { Post, PostResponse } from "../interface/post";
import type { ApiResponse } from "../interface/ApiResponse";

export async function getAllPosts(page = 1, userId?: string, saved = false) {
  const path = saved ? "/users/bookmarks" : userId ? `/users/${userId}/posts` : "/posts";
  const { data } = await api.get<PostResponse & { data: { bookmarks?: Post[] } }>(path, { params: { page, limit: 10 } });
  return { ...data, data: { posts: saved ? data.data.bookmarks ?? [] : data.data.posts ?? [] } };
}

export async function getPost(id: string) {
  const { data } = await api.get<ApiResponse<{ post: Post }>>(`/posts/${id}`);
  return data.data.post;
}

export async function savePost({ id, form }: { id?: string; form: FormData }) {
  if (id) return api.put(`/posts/${id}`, form);
  return api.post("/posts", form);
}

export async function deletePost(id: string) { await api.delete(`/posts/${id}`); }
export async function toggleLike(id: string) { await api.put(`/posts/${id}/like`); }
export async function toggleBookmark(id: string) { await api.put(`/posts/${id}/bookmark`); }
export async function sharePost({ id, body }: { id: string; body: string }) {
  await api.post(`/posts/${id}/share`, { body });
}
