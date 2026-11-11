export type DeckSection = "POKEMON" | "TRAINER" | "ENERGY";

export interface DeckCard {
  id: number | null;
  externalId: string;
  name: string;
  cardNumber: string | null;
  collectionId: string | null;
  collectionName: string | null;
  imageUrl: string | null;
  section: DeckSection;
  quantity: number;
  ownedQuantity: number;
}

export interface UnresolvedDeckCard {
  lineNumber: number;
  rawLine: string;
  section: DeckSection;
  quantity: number;
  requestedName: string;
  setAbbreviation: string;
  cardNumber: string;
}

export interface DeckParseResult {
  totalLines: number;
  resolvedCount: number;
  unresolvedCount: number;
  resolvedCards: DeckCard[];
  unresolvedCards: UnresolvedDeckCard[];
}

export interface DeckSummary {
  id: number;
  name: string;
  notes: string | null;
  totalCards: number;
  uniqueCards: number;
  createdAt: string;
  updatedAt: string;
}

export interface Deck {
  id: number;
  name: string;
  notes: string | null;
  totalCards: number;
  uniqueCards: number;
  cards: DeckCard[];
  createdAt: string;
  updatedAt: string;
}

export interface DeckCardInput {
  externalId: string;
  section: DeckSection;
  quantity: number;
}
