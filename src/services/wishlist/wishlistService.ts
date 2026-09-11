import type { WishlistCard, WishlistPriority } from "../../types/wishlistCard";
import { apiClient } from "../api/apiClient";

export interface CreateWishlistCardRequest {
  externalId: string;
  priority?: WishlistPriority;
  notes?: string;
  storeUrl?: string;
  targetPriceUsd?: number;
}

export interface UpdateWishlistPriorityRequest {
  priority: WishlistPriority;
}

export interface UpdateWishlistCardRequest {
  notes?: string | null;
  storeUrl?: string | null;
  targetPriceUsd?: number | null;
  priority?: WishlistPriority;
}

export async function createWishlistCard(
  request: CreateWishlistCardRequest,
): Promise<WishlistCard> {
  const response = await apiClient.post<WishlistCard>("/wishlist", request);

  return response.data;
}

export async function findWishlistCards(): Promise<WishlistCard[]> {
  const response = await apiClient.get<WishlistCard[]>("/wishlist");

  return response.data;
}

export async function updateWishlistPriority(
  id: number,
  request: UpdateWishlistPriorityRequest,
): Promise<WishlistCard> {
  const response = await apiClient.patch<WishlistCard>(
    `/wishlist/${id}/priority`,
    request,
  );

  return response.data;
}

export async function updateWishlistCard(
  id: number,
  request: UpdateWishlistCardRequest,
): Promise<WishlistCard> {
  const response = await apiClient.patch<WishlistCard>(
    `/wishlist/${id}`,
    request,
  );

  return response.data;
}

export async function deleteWishlistCard(id: number): Promise<void> {
  await apiClient.delete(`/wishlist/${id}`);
}
