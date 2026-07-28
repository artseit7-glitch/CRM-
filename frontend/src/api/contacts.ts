import { apiClient } from "./client";
import type { Contact, ContactDetail, Paginated } from "../types";

export interface ContactPayload {
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  position?: string;
  company?: number | null;
  notes?: string;
}

export async function listContacts(search?: string) {
  const res = await apiClient.get<Paginated<Contact>>("/contacts/", {
    params: search ? { search } : undefined,
  });
  return res.data;
}

export async function listAllContacts(): Promise<Contact[]> {
  let url: string | null = "/contacts/";
  const all: Contact[] = [];
  while (url) {
    const res: { data: Paginated<Contact> } = await apiClient.get(url);
    all.push(...res.data.results);
    url = res.data.next;
  }
  return all;
}

export async function getContact(id: number) {
  const res = await apiClient.get<ContactDetail>(`/contacts/${id}/`);
  return res.data;
}

export async function createContact(payload: ContactPayload) {
  const res = await apiClient.post<Contact>("/contacts/", payload);
  return res.data;
}

export async function updateContact(id: number, payload: ContactPayload) {
  const res = await apiClient.patch<Contact>(`/contacts/${id}/`, payload);
  return res.data;
}

export async function deleteContact(id: number) {
  await apiClient.delete(`/contacts/${id}/`);
}
