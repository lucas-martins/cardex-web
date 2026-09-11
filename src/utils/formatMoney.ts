export function formatUsd(
  value: number | string | null | undefined,
): string {
  const amount = toNumber(value);

  if (amount === null) {
    return "—";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

export function formatEur(
  value: number | string | null | undefined,
): string {
  const amount = toNumber(value);

  if (amount === null) {
    return "—";
  }

  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
}

export function formatBrl(
  value: number | string | null | undefined,
): string {
  const amount = toNumber(value);

  if (amount === null) {
    return "—";
  }

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(amount);
}

export function formatMarketPrices(
  usd: number | string | null | undefined,
  eur: number | string | null | undefined,
  brl?: number | string | null | undefined,
): string {
  const brlLabel = formatBrl(brl);
  const usdLabel = formatUsd(usd);
  const eurLabel = formatEur(eur);

  const parts = [brlLabel, usdLabel, eurLabel].filter(
    (label) => label !== "—",
  );

  if (parts.length === 0) {
    return "Price unavailable";
  }

  return parts.join(" · ");
}

function toNumber(
  value: number | string | null | undefined,
): number | null {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const amount = typeof value === "number" ? value : Number(value);

  if (!Number.isFinite(amount)) {
    return null;
  }

  return amount;
}
