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