export interface CollectionAnalyticsItem {
  name: string;
  quantity: number;
}

export interface CollectionAnalytics {
  collections: CollectionAnalyticsItem[];
  languages: CollectionAnalyticsItem[];
  conditions: CollectionAnalyticsItem[];
  rarities: CollectionAnalyticsItem[];
  collectionValues?: CollectionValueItem[];
}

export interface CollectionValueItem {
  name: string;
  estimatedValueUsd: number;
  estimatedValueEur: number;
  estimatedValueBrl?: number;
}