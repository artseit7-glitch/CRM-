import { apiClient } from "./client";
import type { Paginated, Role, User } from "../types";

export interface UserPayload {
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role: Role;
  password?: string;
}

export async function listUsers() {
  const res = await apiClient.get<Paginated<User>>("/users/");
  return res.data;
}

export async function createUser(payload: UserPayload) {
  const res = await apiClient.post<User>("/users/", payload);
  return res.data;
}

export async function updateUser(id: number, payload: Partial<UserPayload>) {
  const res = await apiClient.patch<User>(`/users/${id}/`, payload);
  return res.data;
}

export async function deleteUser(id: number) {
  await apiClient.delete(`/users/${id}/`);
}
