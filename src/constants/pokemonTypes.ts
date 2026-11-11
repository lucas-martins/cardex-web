export const POKEMON_TYPES = [
  "Colorless",
  "Darkness",
  "Dragon",
  "Fairy",
  "Fighting",
  "Fire",
  "Grass",
  "Lightning",
  "Metal",
  "Psychic",
  "Water",
] as const;

export type PokemonType = (typeof POKEMON_TYPES)[number];

export function cardHasType(
  types: string[] | null | undefined,
  type: string,
) {
  if (!type.trim()) {
    return true;
  }

  return (types ?? []).some(
    (value) => value.toLowerCase() === type.trim().toLowerCase(),
  );
}
