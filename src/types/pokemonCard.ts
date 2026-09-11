import type { WishlistPriority } from "./wishlistCard";

export interface PokemonCardSearchResult {
  externalId: string;
  name: string;
  collectionName: string;
  cardNumber: string;
  rarity: string | null;
  imageUrl: string | null;

  owned: boolean;
  cardId: number | null;

  inWishlist: boolean;
  wishlistId: number | null;
  wishlistPriority: WishlistPriority | null;
  marketPriceUsd?: number | null;
  marketPriceEur?: number | null;
}

export interface PokemonCardSearchPage {
  content: PokemonCardSearchResult[];

  page: number;

  pageSize: number;

  count: number;

  totalElements: number;

  totalPages: number;

  first: boolean;

  last: boolean;
}

export interface PokemonCollection {
  id: string;
  name: string;
  series: string;
  printedTotal: number;
  total: number;
  ownedCards: number;
  completionPercentage: number;
}