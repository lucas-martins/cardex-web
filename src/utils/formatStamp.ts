import type { CardStamp } from "../types/card";

const STAMP_LABELS: Record<CardStamp, string> = {
  NONE: "None",
  LEAGUE: "League",
  POKEMON_CENTER: "Pokémon Center",
  STAFF: "Staff",
  PRE_RELEASE: "Pre-Release",
  W_PROMO: "W Promo",
  WORLDS: "Worlds",
  SET_LOGO: "Set Logo",
  OTHER: "Other",
};

export const CARD_STAMP_OPTIONS: { value: CardStamp; label: string }[] = [
  { value: "NONE", label: STAMP_LABELS.NONE },
  { value: "LEAGUE", label: STAMP_LABELS.LEAGUE },
  { value: "POKEMON_CENTER", label: STAMP_LABELS.POKEMON_CENTER },
  { value: "STAFF", label: STAMP_LABELS.STAFF },
  { value: "PRE_RELEASE", label: STAMP_LABELS.PRE_RELEASE },
  { value: "W_PROMO", label: STAMP_LABELS.W_PROMO },
  { value: "WORLDS", label: STAMP_LABELS.WORLDS },
  { value: "SET_LOGO", label: STAMP_LABELS.SET_LOGO },
  { value: "OTHER", label: STAMP_LABELS.OTHER },
];

export function formatStamp(stamp?: CardStamp | null) {
  if (!stamp) {
    return STAMP_LABELS.NONE;
  }

  return STAMP_LABELS[stamp] ?? stamp;
}
