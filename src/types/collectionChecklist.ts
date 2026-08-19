import type { WishlistPriority } from "./wishlistCard";

export interface CollectionChecklistCard {
  externalId: string;
  name: string;
  cardNumber: string;
  rarity: string | null;
  imageUrl: string | null;
  owned: boolean;
  cardId: number | null;

  inWishlist: boolean;
  wishlistId: number | null;
  wishlistPriority: WishlistPriority | null;
}

export interface CollectionChecklist {
  collectionId: string;
  collectionName: string;
  ownedUniqueCards: number;
  totalCards: number;
  completionPercentage: number;
  cards: CollectionChecklistCard[];
}