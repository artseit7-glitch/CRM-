import { apiClient } from "./client";
import type { Company, Paginated } from "../types";

export interface CompanyPayload {
  name: string;
  industry?: string;
  website?: string;
  phone?: string;
  notes?: string;
}

export async function listCompanies(search?: string) {
  const res = await apiClient.get<Paginated<Company>>("/companies/", {
    params: search ? { search } : undefined,
  });
  return res.data;
}

export async function listAllCompanies(): Promise<Company[]> {
  let url: string | null = "/companies/";
  const all: Company[] = [];
  while (url) {
    const res: { data: Paginated<Company> } = await apiClient.get(url);
    all.push(...res.data.results);
    url = res.data.next;
  }
  return all;
}

export async function createCompany(payload: CompanyPayload) {
  const res = await apiClient.post<Company>("/companies/", payload);
  return res.data;
}

export async function updateCompany(id: number, payload: CompanyPayload) {
  const res = await apiClient.patch<Company>(`/companies/${id}/`, payload);
  return res.data;
}

export async function deleteCompany(id: number) {
  await apiClient.delete(`/companies/${id}/`);
}
