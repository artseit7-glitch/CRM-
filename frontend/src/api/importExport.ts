import { apiClient } from "./client";
import type { ImportResult } from "../types";

export type ImportExportResource = "contacts" | "deals";
export type FileType = "csv" | "xlsx";

export async function importFile(
  resource: ImportExportResource,
  file: File
): Promise<ImportResult> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await apiClient.post<ImportResult>(
    `/import-export/${resource}/import/`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return res.data;
}

export async function exportFile(
  resource: ImportExportResource,
  filetype: FileType
) {
  const res = await apiClient.get(`/import-export/${resource}/export/`, {
    params: { filetype },
    responseType: "blob",
  });
  const blob = new Blob([res.data]);
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${resource}.${filetype}`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}
