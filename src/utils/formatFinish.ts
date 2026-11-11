import type { CardFinish } from "../types/card";

const FINISH_LABELS: Record<CardFinish, string> = {
  NORMAL: "Normal",
  HOLOFOIL: "Holofoil",
  REVERSE_HOLO: "Reverse Holo",
  FIRST_EDITION: "First Edition",
  OTHER: "Other",
};

export function formatFinish(finish?: CardFinish | null) {
  if (!finish) {
    return FINISH_LABELS.NORMAL;
  }

  return FINISH_LABELS[finish] ?? finish;
}
