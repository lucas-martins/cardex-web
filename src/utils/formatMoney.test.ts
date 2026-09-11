import { describe, expect, it } from "vitest";

import {
  formatEur,
  formatMarketPrices,
  formatUsd,
} from "./formatMoney";

describe("formatMoney", () => {
  it("formats usd and eur values", () => {
    expect(formatUsd(1.5)).toBe("$1.50");
    expect(formatEur(2)).toContain("2,00");
  });

  it("combines available market prices", () => {
    expect(formatMarketPrices(1.5, 2)).toContain("$1.50");
    expect(formatMarketPrices(null, null)).toBe("Price unavailable");
    expect(formatMarketPrices(1.25, null)).toBe("$1.25");
  });
});
