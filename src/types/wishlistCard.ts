export type WishlistPriority =
  | "HIGH"
  | "MEDIUM"
  | "LOW";

export interface WishlistCard {
  id: number;
  externalId: string;
  name: string;
  cardNumber: string | null;
  collectionId: string | null;
  collectionName: string | null;
  series: string | null;
  rarity: string | null;
  imageUrl: string | null;
  priority: WishlistPriority;
  createdAt: string;
  updatedAt: string;
}