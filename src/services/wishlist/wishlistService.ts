import type { WishlistCard } from "../../types/wishlistCard";
import { apiClient } from "../api/apiClient";

export interface CreateWishlistCardRequest {
  externalId: string;
}

export async function createWishlistCard(
  request: CreateWishlistCardRequest,
): Promise<WishlistCard> {
  const response = await apiClient.post<WishlistCard>(
    "/wishlist",
    request,
  );

  return response.data;
}

export async function findWishlistCards(): Promise<WishlistCard[]> {
  const response = await apiClient.get<WishlistCard[]>("/wishlist");

  return response.data;
}

export async function deleteWishlistCard(id: number): Promise<void> {
  await apiClient.delete(`/wishlist/${id}`);
}