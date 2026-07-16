export interface MostOwnedCard {
  name: string;
  quantity: number;
}

export interface CollectionSummary {
  uniqueCards: number;
  totalCards: number;
  differentLanguages: number;
  differentCollections: number;
  mostOwnedCard: MostOwnedCard | null;
}