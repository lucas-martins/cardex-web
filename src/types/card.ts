export type CardLanguage =
  | "ENGLISH"
  | "PORTUGUESE"
  | "JAPANESE"
  | "SPANISH"
  | "FRENCH"
  | "GERMAN"
  | "ITALIAN"
  | "KOREAN"
  | "CHINESE";

export type CardCondition =
  | "MINT"
  | "NEAR_MINT"
  | "EXCELLENT"
  | "GOOD"
  | "LIGHTLY_PLAYED"
  | "PLAYED"
  | "POOR";

export interface Card {
  id: number;
  externalId: string;
  name: string;
  collectionName: string;
  cardNumber: string;
  rarity: string | null;
  quantity: number;
  language: CardLanguage;
  condition: CardCondition;
  imageUrl: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  favorite: boolean;
}