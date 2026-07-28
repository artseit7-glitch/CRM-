import { apiClient } from "./client";
import type { Deal, DealStage, Paginated } from "../types";

export interface DealPayload {
  title: string;
  contact?: number | null;
  company?: number | null;
  amount: string;
  stage: DealStage;
  probability?: number;
  expected_close_date?: string | null;
}

export interface DealFilters {
  stage?: DealStage;
  company?: number;
  contact?: number;
  [key: string]: string | number | undefined;
}

export async function listDeals(filters?: DealFilters) {
  const res = await apiClient.get<Paginated<Deal>>("/deals/", {
    params: filters,
  });
  return res.data;
}

export async function listAllDeals(filters?: DealFilters): Promise<Deal[]> {
  // Kanban board needs the full set, not just one page.
  let url: string | null = "/deals/";
  let params: Record<string, unknown> | undefined = filters;
  const all: Deal[] = [];
  while (url) {
    const res: { data: Paginated<Deal> } = await apiClient.get(url, {
      params,
    });
    all.push(...res.data.results);
    url = res.data.next;
    params = undefined;
  }
  return all;
}

export async function createDeal(payload: DealPayload) {
  const res = await apiClient.post<Deal>("/deals/", payload);
  return res.data;
}

export async function updateDeal(id: number, payload: Partial<DealPayload>) {
  const res = await apiClient.patch<Deal>(`/deals/${id}/`, payload);
  return res.data;
}

export async function deleteDeal(id: number) {
  await apiClient.delete(`/deals/${id}/`);
}
