import { apiClient } from "./client";
import type { Paginated, Task, TaskStatus } from "../types";

export interface TaskPayload {
  title: string;
  description?: string;
  due_date?: string | null;
  status?: TaskStatus;
  deal?: number | null;
  contact?: number | null;
  assignee?: number;
}

export interface TaskFilters {
  status?: TaskStatus;
  assignee?: number;
  deal?: number;
  contact?: number;
}

export async function listTasks(filters?: TaskFilters) {
  const res = await apiClient.get<Paginated<Task>>("/tasks/", {
    params: filters,
  });
  return res.data;
}

export async function createTask(payload: TaskPayload) {
  const res = await apiClient.post<Task>("/tasks/", payload);
  return res.data;
}

export async function updateTask(id: number, payload: Partial<TaskPayload>) {
  const res = await apiClient.patch<Task>(`/tasks/${id}/`, payload);
  return res.data;
}

export async function deleteTask(id: number) {
  await apiClient.delete(`/tasks/${id}/`);
}
