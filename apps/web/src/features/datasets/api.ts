import { apiClient } from "@/lib/api/client";

export type Dataset = {
  id: string;
  name: string;
  createdAt?: string;
};

export async function fetchDatasets(): Promise<Dataset[]> {
  const res = await apiClient<{ data: Dataset[] }>("/api/platform/datasets");
  return res.data ?? [];
}

export async function createDataset(body: { name: string }) {
  return apiClient<Dataset>("/api/platform/datasets", {
    method: "POST",
    body: JSON.stringify(body),
  });
}
