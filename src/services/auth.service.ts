import type { RegisterFormData } from "../interface/register";
import type { loginFormData } from "../interface/login";
import type { User } from "../interface/user";
import type { ApiResponse } from "../interface/ApiResponse";
import { api } from "./api";

interface AuthResult { token: string; user: User }

export async function signUp(values: RegisterFormData) {
  const { data } = await api.post<ApiResponse<AuthResult>>("/users/signup", values);
  return { ...data.data, message: data.message };
}

export async function signIn(values: loginFormData) {
  const { data } = await api.post<ApiResponse<AuthResult>>("/users/signin", values);
  if (!data.data?.token) throw new Error("The server did not return a login token. Please try again.");
  return { ...data.data, message: data.message };
}

export async function changePassword(values: { password: string; newPassword: string }) {
  const { data } = await api.patch<ApiResponse<AuthResult>>("/users/change-password", values);
  return data.data;
}
