import { apiClient } from "../api/apiClient";
import type { PokemonCardSearchPage, PokemonCollection } from "../../types/pokemonCard";

export interface SearchPokemonCardsParams {
  name?: string;
  setId?: string;
  number?: string;
  rarity?: string;
  type?: string;
  page?: number;
  size?: number;
}

export async function searchPokemonCards({
  name,
  setId,
  number,
  rarity,
  type,
  page = 1,
  size = 20,
}: SearchPokemonCardsParams): Promise<PokemonCardSearchPage> {
  const response = await apiClient.get<PokemonCardSearchPage>(
    "/pokemon/cards",
    {
      params: {
        name: name || undefined,
        setId: setId || undefined,
        number: number || undefined,
        rarity: rarity || undefined,
        type: type || undefined,
        page,
        size,
      },
      timeout: 30000,
    },
  );

  return response.data;
}

export async function findPokemonCollections(): Promise<PokemonCollection[]> {
  const response = await apiClient.get<PokemonCollection[]>(
    "/pokemon/cards/collections",
    {
      timeout: 30000,
    },
  );

  return response.data;
}
