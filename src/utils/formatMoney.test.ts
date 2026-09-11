import { describe, expect, it } from "vitest";

import {
  formatBrl,
  formatEur,
  formatMarketPrices,
  formatUsd,
} from "./formatMoney";

describe("formatMoney", () => {
  it("formats usd, eur and brl values", () => {
    expect(formatUsd(1.5)).toBe("$1.50");
    expect(formatEur(2)).toContain("2,00");
    expect(formatBrl(10)).toContain("10,00");
  });

  it("combines available market prices with brl first", () => {
    expect(formatMarketPrices(1.5, 2, 7.5)).toContain("7,50");
    expect(formatMarketPrices(1.5, 2, 7.5)).toContain("$1.50");
    expect(formatMarketPrices(null, null, null)).toBe("Price unavailable");
    expect(formatMarketPrices(1.25, null)).toBe("$1.25");
  });
});
