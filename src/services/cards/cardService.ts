import { apiClient } from "../api/apiClient";
import type {
  Card,
  CardCondition,
  CardLanguage,
} from "../../types/card";
import type { PageResponse } from "../../types/page";


export interface FindCardsParams {
  page?: number;
  size?: number;
  name?: string;
  language?: string;
  condition?: string;
}

export interface CreateCardRequest {
  externalId: string;
  quantity: number;
  language: CardLanguage;
  condition: CardCondition;
  notes?: string;
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

export async function createCard(
  request: CreateCardRequest,
): Promise<Card> {
  const response = await apiClient.post<Card>("/cards", request);

  return response.data;
}

export async function deleteCard(id: number): Promise<void> {
  await apiClient.delete(`/cards/${id}`);
}

export interface UpdateCardQuantityRequest {
  quantity: number;
}

export async function updateCardQuantity(
  id: number,
  request: UpdateCardQuantityRequest,
): Promise<Card> {
  const response = await apiClient.patch<Card>(
    `/cards/${id}/quantity`,
    request,
  );

  return response.data;
}