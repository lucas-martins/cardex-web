import { apiClient } from "../api/apiClient";
import type { Card } from "../../types/card";
import type { PageResponse } from "../../types/page";

export interface FindCardsParams {
  page?: number;
  size?: number;
  name?: string;
  language?: string;
  condition?: string;
}

export async function findCards(
  params: FindCardsParams = {},
): Promise<PageResponse<Card>> {
  const response = await apiClient.get<PageResponse<Card>>("/cards", {
    params: {
      page: params.page ?? 0,
      size: params.size ?? 20,
      name: params.name || undefined,
      language: params.language || undefined,
      condition: params.condition || undefined,
    },
  });

  return response.data;
}