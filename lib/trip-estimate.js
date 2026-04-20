const DEFAULT_BUDGET = "Standard";
const DEFAULT_CURRENCY = "USD";

const activityCostMap = {
  Shoestring: {
    food: 14,
    landmark: 18,
    transit: 9
  },
  Standard: {
    food: 28,
    landmark: 42,
    transit: 18
  },
  Luxury: {
    food: 78,
    landmark: 118,
    transit: 46
  }
};

const dailyFallbackMap = {
  Shoestring: 78,
  Standard: 185,
  Luxury: 430
};

const countryCurrencyMap = {
  india: "INR",
  japan: "JPY",
  "united states": "USD",
  usa: "USD",
  "united states of america": "USD",
  "united kingdom": "GBP",
  uk: "GBP",
  england: "GBP",
  scotland: "GBP",
  ireland: "EUR",
  france: "EUR",
  germany: "EUR",
  italy: "EUR",
  spain: "EUR",
  greece: "EUR",
  portugal: "EUR",
  monaco: "EUR",
  switzerland: "CHF",
  canada: "CAD",
  australia: "AUD",
  "new zealand": "NZD",
  singapore: "SGD",
  "south korea": "KRW",
  korea: "KRW",
  taiwan: "TWD",
  mexico: "MXN",
  uae: "AED",
  "united arab emirates": "AED",
  turkey: "TRY",
  iceland: "ISK",
  peru: "PEN",
  jordan: "JOD",
  egypt: "EGP",
  indonesia: "IDR",
  maldives: "MVR"
};

const usdConversionRates = {
  USD: 1,
  INR: 83.5,
  JPY: 151,
  EUR: 0.92,
  GBP: 0.79,
  CHF: 0.9,
  CAD: 1.37,
  AUD: 1.54,
  NZD: 1.68,
  SGD: 1.35,
  KRW: 1370,
  TWD: 32.5,
  MXN: 16.8,
  AED: 3.67,
  TRY: 32.2,
  ISK: 138,
  PEN: 3.75,
  JOD: 0.71,
  EGP: 48.5,
  IDR: 16250,
  MVR: 15.4
};

export function getNormalizedBudgetTier(value) {
  const rawValue = String(value || "").trim();
  if (rawValue === "Shoestring" || rawValue === "Luxury") {
    return rawValue;
  }

  return DEFAULT_BUDGET;
}

export function estimateActivityCost({
  budgetTier = DEFAULT_BUDGET,
  type = "landmark",
  activityIndex = 0
}) {
  const safeBudget = getNormalizedBudgetTier(budgetTier);
  const safeType = type === "food" || type === "transit" ? type : "landmark";
  const baseAmount = activityCostMap[safeBudget][safeType];
  const multiplier = 1 + Math.min(Math.max(activityIndex, 0), 4) * 0.08;

  return Number((baseAmount * multiplier).toFixed(2));
}

function parseStoredCost(value) {
  if (value === null || value === undefined) return null;

  const numericValue = Number(
    String(value)
      .trim()
      .replace(/[^0-9.]/g, "")
  );

  return Number.isFinite(numericValue) ? numericValue : null;
}

export function estimateTripTotal({ days = [], budgetTier = DEFAULT_BUDGET }) {
  const safeBudget = getNormalizedBudgetTier(budgetTier);
  const safeDays = Array.isArray(days) ? days : [];

  let total = 0;
  let activityCount = 0;

  safeDays.forEach((day) => {
    const activities = Array.isArray(day?.activities) ? day.activities : [];

    activities.forEach((activity, index) => {
      activityCount += 1;
      const storedCost = parseStoredCost(activity?.costEstimate);
      total +=
        storedCost ??
        estimateActivityCost({
          budgetTier: safeBudget,
          type: activity?.type || "landmark",
          activityIndex: index
        });
    });
  });

  if (activityCount === 0) {
    const dayCount = safeDays.length > 0 ? safeDays.length : 1;
    total = dailyFallbackMap[safeBudget] * dayCount;
  }

  return Number(total.toFixed(2));
}

export function getCurrencyForCountry(country, isGuest = false) {
  if (isGuest) return DEFAULT_CURRENCY;

  const normalizedCountry = String(country || "").trim().toLowerCase();
  if (!normalizedCountry) return DEFAULT_CURRENCY;

  return countryCurrencyMap[normalizedCountry] || DEFAULT_CURRENCY;
}

export function formatCurrencyAmount(amount, currencyCode = DEFAULT_CURRENCY) {
  const safeAmount = Number(amount);
  const safeCurrency = String(currencyCode || DEFAULT_CURRENCY).trim().toUpperCase();
  const fractionDigits = ["JPY", "KRW", "ISK"].includes(safeCurrency) ? 0 : 2;
  const convertedAmount =
    safeAmount *
    (usdConversionRates[safeCurrency] || usdConversionRates[DEFAULT_CURRENCY]);

  if (!Number.isFinite(safeAmount)) {
    return "Estimate unavailable";
  }

  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: safeCurrency,
      maximumFractionDigits: fractionDigits
    }).format(convertedAmount);
  } catch {
    return `${safeCurrency} ${convertedAmount.toFixed(fractionDigits)}`;
  }
}
