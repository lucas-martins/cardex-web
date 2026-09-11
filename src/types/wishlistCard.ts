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
  notes?: string | null;
  storeUrl?: string | null;
  targetPriceUsd?: number | null;
  createdAt: string;
  updatedAt: string;
  marketPriceUsd?: number | null;
  marketPriceEur?: number | null;
  marketPriceBrl?: number | null;
}
