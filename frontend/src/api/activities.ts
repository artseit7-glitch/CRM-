import { apiClient } from "./client";
import type { Activity, ActivityType } from "../types";

export interface ActivityPayload {
  contact?: number | null;
  deal?: number | null;
  type: ActivityType;
  text: string;
}

export async function createActivity(payload: ActivityPayload) {
  const res = await apiClient.post<Activity>("/activities/", payload);
  return res.data;
}
