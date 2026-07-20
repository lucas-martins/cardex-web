import { apiClient } from "../api/apiClient";
import type {
  Card,
  CardCondition,
  CardLanguage,
} from "../../types/card";
import type { PageResponse } from "../../types/page";
import type { CollectionSummary } from "../../types/collectionSummary";
import type { CollectionAnalytics } from "../../types/collectionAnalytics";
import type { CollectionGoals } from "../../types/collectionGoals";


export interface FindCardsParams {
  page?: number;
  size?: number;
  name?: string;
  language?: CardLanguage;
  condition?: CardCondition;
  favorite?: boolean;
  sort?: string;
}

export interface CreateCardRequest {
  externalId: string;
  quantity: number;
  language: CardLanguage;
  condition: CardCondition;
  notes?: string;
}

export interface UpdateCardRequest {
  quantity: number;
  language: CardLanguage;
  condition: CardCondition;
  notes?: string;
}

export interface UpdateFavoriteRequest {
  favorite: boolean;
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
      favorite: params.favorite,
      sort: params.sort || undefined,
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

export async function updateCard(
  id: number,
  request: UpdateCardRequest,
): Promise<Card> {
  const response = await apiClient.put<Card>(
    `/cards/${id}`,
    request,
  );

  return response.data;
}

export async function getCollectionSummary(): Promise<CollectionSummary> {
  const response = await apiClient.get<CollectionSummary>("/cards/summary");

  return response.data;
}

export async function updateFavorite(
  id: number,
  request: UpdateFavoriteRequest,
): Promise<Card> {
  const response = await apiClient.patch<Card>(
    `/cards/${id}/favorite`,
    request,
  );

  return response.data;
}

export async function findCardById(id: number): Promise<Card> {
  const response = await apiClient.get<Card>(`/cards/${id}`);

  return response.data;
}

export async function getCollectionAnalytics(): Promise<CollectionAnalytics> {
  const response =
    await apiClient.get<CollectionAnalytics>("/cards/analytics");

  return response.data;
}

export async function getCollectionGoals(): Promise<CollectionGoals> {
  const response =
    await apiClient.get<CollectionGoals>("/cards/goals");

  return response.data;
}