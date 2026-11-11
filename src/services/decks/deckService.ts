import type {
  Deck,
  DeckCardInput,
  DeckParseResult,
  DeckSection,
  DeckSummary,
} from "../../types/deck";
import { apiClient } from "../api/apiClient";

export async function parseDeckList(listText: string): Promise<DeckParseResult> {
  const response = await apiClient.post<DeckParseResult>(
    "/decks/parse",
    { listText },
    { timeout: 120000 },
  );

  return response.data;
}

export async function findDecks(): Promise<DeckSummary[]> {
  const response = await apiClient.get<DeckSummary[]>("/decks");
  return response.data;
}

export async function findDeckById(id: number): Promise<Deck> {
  const response = await apiClient.get<Deck>(`/decks/${id}`);
  return response.data;
}

export async function createDeck(request: {
  name: string;
  notes?: string;
  cards: DeckCardInput[];
}): Promise<Deck> {
  const response = await apiClient.post<Deck>("/decks", request);
  return response.data;
}

export async function updateDeck(
  id: number,
  request: { name?: string; notes?: string | null },
): Promise<Deck> {
  const response = await apiClient.patch<Deck>(`/decks/${id}`, request);
  return response.data;
}

export async function replaceDeckCards(
  id: number,
  cards: DeckCardInput[],
): Promise<Deck> {
  const response = await apiClient.put<Deck>(`/decks/${id}/cards`, { cards });
  return response.data;
}

export async function addDeckCard(
  id: number,
  request: {
    externalId: string;
    section: DeckSection;
    quantity: number;
  },
): Promise<Deck> {
  const response = await apiClient.post<Deck>(`/decks/${id}/cards`, request);
  return response.data;
}

export async function removeDeckCard(
  deckId: number,
  cardId: number,
): Promise<Deck> {
  const response = await apiClient.delete<Deck>(
    `/decks/${deckId}/cards/${cardId}`,
  );
  return response.data;
}

export async function deleteDeck(id: number): Promise<void> {
  await apiClient.delete(`/decks/${id}`);
}
