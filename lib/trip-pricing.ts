const DEFAULT_CURRENCY = "USD";

export function normalizeEstimatedCostForDb(value: unknown) {
  if (value === null || value === undefined) return null;

  const raw = String(value).trim();
  if (!raw || raw.toLowerCase() === "null" || raw.toLowerCase() === "n/a") {
    return null;
  }

  const numericPart = raw.replace(/[^0-9.]/g, "");
  if (!numericPart) return null;

  const parsed = Number(numericPart);
  if (!Number.isFinite(parsed) || parsed < 0) return null;

  return parsed.toFixed(2);
}

export function normalizeEstimatedCurrency(
  value: unknown,
  fallback = DEFAULT_CURRENCY
) {
  const raw = String(value || "")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z]/g, "");

  if (raw.length === 3) {
    return raw;
  }

  return fallback;
}

export function normalizeEstimateNote(value: unknown) {
  const raw = String(value || "").replace(/\s+/g, " ").trim();
  return raw || "Estimated by TripSense AI during trip generation.";
}

export function formatStoredPrice(
  amount: string | number | null | undefined,
  currencyCode: string | null | undefined
) {
  const parsedAmount = Number(amount);
  if (!Number.isFinite(parsedAmount)) {
    return "Estimate unavailable";
  }

  const safeCurrency = normalizeEstimatedCurrency(currencyCode);
  const fractionDigits = ["JPY", "KRW", "ISK"].includes(safeCurrency) ? 0 : 2;

  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: safeCurrency,
      maximumFractionDigits: fractionDigits
    }).format(parsedAmount);
  } catch {
    return `${safeCurrency} ${parsedAmount.toFixed(fractionDigits)}`;
  }
}
