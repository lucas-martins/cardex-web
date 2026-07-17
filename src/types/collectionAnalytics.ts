export interface CollectionAnalyticsItem {
  name: string;
  quantity: number;
}

export interface CollectionAnalytics {
  collections: CollectionAnalyticsItem[];
  languages: CollectionAnalyticsItem[];
  conditions: CollectionAnalyticsItem[];
  rarities: CollectionAnalyticsItem[];
}