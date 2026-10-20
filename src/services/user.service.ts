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

async function uploadUserImage(endpoint: "/users/upload-photo" | "/users/upload-cover", field: "photo" | "cover", file: File) {
  const form = new FormData();
  form.append(field, file);
  form.append("privacy", "public");
  await api.put(endpoint, form);
  // The upload endpoints do not always return the complete user. Reading the
  // profile again keeps the navbar, profile page, and future refreshes in sync.
  return getMyProfile();
}

export function uploadProfilePhoto(file: File) {
  return uploadUserImage("/users/upload-photo", "photo", file);
}

export function uploadCoverPhoto(file: File) {
  return uploadUserImage("/users/upload-cover", "cover", file);
}
