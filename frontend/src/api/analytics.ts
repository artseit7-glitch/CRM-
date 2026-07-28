import { apiClient } from "./client";
import type { ManagerActivity, PipelineAnalytics, RevenueByMonth } from "../types";

export async function fetchPipelineAnalytics() {
  const res = await apiClient.get<PipelineAnalytics>("/analytics/pipeline/");
  return res.data;
}

export async function fetchRevenueByMonth() {
  const res = await apiClient.get<RevenueByMonth[]>(
    "/analytics/revenue-by-month/"
  );
  return res.data;
}

export async function fetchManagerActivity() {
  const res = await apiClient.get<ManagerActivity[]>(
    "/analytics/manager-activity/"
  );
  return res.data;
}
