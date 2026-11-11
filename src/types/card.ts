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
  | "SLIGHTLY_PLAYED"
  | "MODERATELY_PLAYED"
  | "HEAVILY_PLAYED"
  | "DAMAGED";

export type CardFinish =
  | "NORMAL"
  | "HOLOFOIL"
  | "REVERSE_HOLO"
  | "FIRST_EDITION"
  | "OTHER";

export type CardStamp =
  | "NONE"
  | "LEAGUE"
  | "POKEMON_CENTER"
  | "STAFF"
  | "PRE_RELEASE"
  | "W_PROMO"
  | "WORLDS"
  | "SET_LOGO"
  | "OTHER";

export interface Card {
  id: number;
  externalId: string;
  name: string;
  collectionId: string | null;
  collectionName: string;
  cardNumber: string;
  rarity: string | null;
  quantity: number;
  language: CardLanguage;
  condition: CardCondition;
  finish?: CardFinish;
  stamp?: CardStamp;
  gradingCompany?: string | null;
  grade?: string | null;
  imageUrl: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  favorite: boolean;
  marketPriceUsd?: number | null;
  marketPriceEur?: number | null;
  marketPriceBrl?: number | null;
  estimatedValueUsd?: number | null;
  estimatedValueEur?: number | null;
  estimatedValueBrl?: number | null;
}
