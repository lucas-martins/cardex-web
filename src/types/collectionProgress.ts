export interface CollectionProgress {
  collectionId: string;
  collectionName: string;
  ownedCards: number;
  totalCards: number;
  completionPercentage: number;
  estimatedValueUsd?: number;
  estimatedValueEur?: number;
  estimatedValueBrl?: number;
}