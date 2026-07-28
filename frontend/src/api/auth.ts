import { apiClient } from "./client";
import type { User } from "../types";

export interface LoginPayload {
  username: string;
  password: string;
}

export interface LoginResponse {
  access: string;
  refresh: string;
}

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  const res = await apiClient.post<LoginResponse>("/auth/login/", payload);
  return res.data;
}

export async function fetchMe(): Promise<User> {
  const res = await apiClient.get<User>("/auth/me/");
  return res.data;
}
