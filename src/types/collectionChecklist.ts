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
  marketPriceUsd?: number | null;
  marketPriceEur?: number | null;
  marketPriceBrl?: number | null;
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
  estimatedOwnedValueUsd?: number;
  estimatedOwnedValueEur?: number;
  estimatedOwnedValueBrl?: number;
  estimatedMissingValueUsd?: number;
  estimatedMissingValueEur?: number;
  estimatedMissingValueBrl?: number;
  cards: CollectionChecklistCard[];
}