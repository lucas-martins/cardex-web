export type CardHistoryAction =
  | "ADDED"
  | "UPDATED"
  | "FAVORITED"
  | "UNFAVORITED"
  | "REMOVED";

export interface CardHistory {
  id: number;
  cardId: number | null;
  externalId: string | null;
  cardName: string;
  action: CardHistoryAction;
  description: string;
  createdAt: string;
  cardExists: boolean;
}

export interface CardHistoryPage {
  content: CardHistory[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
}