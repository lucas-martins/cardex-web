import { apiClient } from "../api/apiClient";
import type { CollectionChecklist } from "../../types/collectionChecklist";
import type { PublicShareResponse, ShareStatus } from "../../types/share";

export async function getShareStatus(): Promise<ShareStatus> {
  const response = await apiClient.get<ShareStatus>("/share");

  return response.data;
}

export async function enableShare(): Promise<ShareStatus> {
  const response = await apiClient.post<ShareStatus>("/share/enable");

  return response.data;
}

export async function disableShare(): Promise<void> {
  await apiClient.post("/share/disable");
}

export async function getPublicShare(
  token: string,
): Promise<PublicShareResponse> {
  const response = await apiClient.get<PublicShareResponse>(
    `/public/share/${token}`,
  );

  return response.data;
}

export async function getPublicShareChecklist(
  token: string,
  collectionId: string,
): Promise<CollectionChecklist> {
  const response = await apiClient.get<CollectionChecklist>(
    `/public/share/${token}/collections/${collectionId}/checklist`,
    {
      timeout: 30000,
    },
  );

  return response.data;
}
