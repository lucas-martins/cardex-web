import type { WishlistPriority } from "./wishlistCard";

export type CardCollectionSection =
  | "NUMBERED"
  | "ADDITIONAL";

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
  section: CardCollectionSection;
}

export interface CollectionChecklist {
  collectionId: string;
  collectionName: string;
  ownedUniqueCards: number;
  totalCards: number;
  completionPercentage: number;
  ownedNumberedCards: number;
  numberedCards: number;
  ownedAdditionalCards: number;
  additionalCards: number;
  cards: CollectionChecklistCard[];
}