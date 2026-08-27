import { apiClient } from "../api/apiClient";
import type { PokemonCardSearchPage, PokemonCollection } from "../../types/pokemonCard";

export interface SearchPokemonCardsParams {
  name: string;
  page?: number;
  size?: number;
}

export async function searchPokemonCards({
  name,
  page = 1,
  size = 20,
}: SearchPokemonCardsParams): Promise<PokemonCardSearchPage> {
  const response = await apiClient.get<PokemonCardSearchPage>(
    "/pokemon/cards",
    {
      params: {
        name,
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