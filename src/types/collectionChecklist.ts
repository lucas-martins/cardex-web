export interface CollectionChecklistCard {
  externalId: string;
  name: string;
  cardNumber: string;
  rarity: string | null;
  imageUrl: string | null;
  owned: boolean;
  cardId: number | null;
}

export interface CollectionChecklist {
  collectionId: string;
  collectionName: string;
  ownedUniqueCards: number;
  totalCards: number;
  completionPercentage: number;
  cards: CollectionChecklistCard[];
}