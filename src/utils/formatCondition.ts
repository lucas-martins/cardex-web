import type { CardCondition } from "../types/card";

const CONDITION_LABELS: Record<CardCondition, string> = {
  MINT: "MINT (M)",
  NEAR_MINT: "Near Mint (NM)",
  SLIGHTLY_PLAYED: "Slightly Played (SP)",
  MODERATELY_PLAYED: "Moderately Played (MP)",
  HEAVILY_PLAYED: "Heavily Played (HP)",
  DAMAGED: "Damage (DM)",
};

export const CARD_CONDITION_OPTIONS: {
  value: CardCondition;
  label: string;
}[] = [
  { value: "MINT", label: CONDITION_LABELS.MINT },
  { value: "NEAR_MINT", label: CONDITION_LABELS.NEAR_MINT },
  { value: "SLIGHTLY_PLAYED", label: CONDITION_LABELS.SLIGHTLY_PLAYED },
  { value: "MODERATELY_PLAYED", label: CONDITION_LABELS.MODERATELY_PLAYED },
  { value: "HEAVILY_PLAYED", label: CONDITION_LABELS.HEAVILY_PLAYED },
  { value: "DAMAGED", label: CONDITION_LABELS.DAMAGED },
];

export function formatCondition(condition?: CardCondition | null) {
  if (!condition) {
    return CONDITION_LABELS.NEAR_MINT;
  }

  return CONDITION_LABELS[condition] ?? condition;
}
