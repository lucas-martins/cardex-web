export interface CollectionOwnedCard {
  id: number;
  externalId: string;
  name: string;
  cardNumber: string;
  rarity?: string;
  imageUrl?: string;
  quantity: number;
  language: string;
  condition: string;
  favorite: boolean;
}

export interface CollectionDetails {
  collectionId: string;
  collectionName: string;
  ownedUniqueCards: number;
  totalCards: number;
  completionPercentage: number;
  cards: CollectionOwnedCard[];
}