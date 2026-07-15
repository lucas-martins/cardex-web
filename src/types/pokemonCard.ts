export interface PokemonCardSearchResult {
  externalId: string;
  name: string;
  collectionName: string;
  cardNumber: string;
  rarity: string | null;
  imageUrl: string | null;
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