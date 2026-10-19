import { api } from "./api";
import type { User } from "../interface/user";
import type { ApiResponse } from "../interface/ApiResponse";

export async function getMyProfile() {
  const { data } = await api.get<ApiResponse<{ user: User }>>("/users/profile-data");
  return data.data.user;
}

export async function getUserProfile(id: string) {
  const { data } = await api.get<ApiResponse<{ user: User; isFollowing?: boolean }>>(`/users/${id}/profile`);
  return { ...data.data.user, isFollowing: data.data.isFollowing ?? data.data.user.isFollowing };
}

export async function getSuggestions(page = 1, search = "") {
  const { data } = await api.get<ApiResponse<{ users?: User[]; suggestions?: User[] }>>(search.trim() ? "/users/search" : "/users/suggestions", { params: { page, limit: 5, q: search.trim() || undefined } });
  return { ...data, data: { users: data.data.users ?? data.data.suggestions ?? [] } };
}

export async function toggleFollow(id: string) {
  const { data } = await api.put<ApiResponse<{ following: boolean }>>(`/users/${id}/follow`);
  return data.data;
}
