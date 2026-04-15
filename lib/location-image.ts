type WikiPage = {
  thumbnail?: {
    source?: string;
  };
};

type WikiResponse = {
  query?: {
    pages?: Record<string, WikiPage>;
  };
};

function getFallbackImage(label: string) {
  return `https://picsum.photos/seed/${encodeURIComponent(label)}/960/640`;
}

function normalizeSearchQuery(value: string) {
  return String(value || "")
    .replace(/[|,;:()[\]{}]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function dedupeQueries(values: string[]) {
  return Array.from(
    new Set(values.map((value) => normalizeSearchQuery(value)).filter(Boolean))
  );
}

function trimGenericPrefix(title: string) {
  return title
    .replace(
      /^(arrival|arrive|depart|departure|travel|transfer|visit|explore|exploration|check[\s-]?in|check[\s-]?out|breakfast|lunch|dinner|snack|walk|stroll|tour|metro|bus|train|ferry|cruise|flight)\b[\s:-]*/i,
      ""
    )
    .trim();
}

function extractPlaceHintsFromTitle(title: string) {
  const cleanTitle = normalizeSearchQuery(title);
  if (!cleanTitle) return [];

  const hints = new Set<string>();
  hints.add(cleanTitle);

  const connectors = [" to ", " in ", " at ", " near ", " around ", " from ", " via "];
  const lower = cleanTitle.toLowerCase();

  for (const connector of connectors) {
    const connectorIndex = lower.indexOf(connector);
    if (connectorIndex >= 0) {
      const after = cleanTitle.slice(connectorIndex + connector.length).trim();
      const before = cleanTitle.slice(0, connectorIndex).trim();
      if (after) hints.add(after);
      if (before) hints.add(before);
    }
  }

  const withoutPrefix = trimGenericPrefix(cleanTitle);
  if (withoutPrefix) hints.add(withoutPrefix);

  return Array.from(hints).filter((item) => item.length >= 2);
}

function isUsableImageUrl(value: string | null | undefined): value is string {
  if (!value) return false;

  const url = String(value).trim();
  if (!/^https?:\/\//i.test(url)) return false;
  if (/placehold\.co/i.test(url)) return false;
  if (/\.svg(\?|#|$)/i.test(url)) return false;

  return true;
}

async function fetchWithTimeout(input: string, timeoutMs: number) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(input, {
      signal: controller.signal,
      cache: "no-store"
    });
  } finally {
    clearTimeout(timeout);
  }
}

async function searchWikipediaImage(query: string) {
  const url = new URL("https://en.wikipedia.org/w/api.php");
  url.searchParams.set("action", "query");
  url.searchParams.set("format", "json");
  url.searchParams.set("origin", "*");
  url.searchParams.set("generator", "search");
  url.searchParams.set("gsrsearch", query);
  url.searchParams.set("gsrlimit", "8");
  url.searchParams.set("prop", "pageimages");
  url.searchParams.set("piprop", "thumbnail");
  url.searchParams.set("pithumbsize", "800");

  const response = await fetchWithTimeout(url.toString(), 7000);
  if (!response.ok) return null;

  const payload = (await response.json()) as WikiResponse;
  const pages = payload?.query?.pages;
  if (!pages) return null;

  const imageUrl = Object.values(pages)
    .map((page) => page?.thumbnail?.source || null)
    .find((candidate) => isUsableImageUrl(candidate));

  return imageUrl || null;
}

type WikiSummaryResponse = {
  thumbnail?: {
    source?: string;
  };
};

async function searchWikipediaSummaryImage(query: string) {
  const normalized = query.trim().replace(/\s+/g, "_");
  if (!normalized) return null;

  const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(normalized)}`;
  const response = await fetchWithTimeout(url, 7000);
  if (!response.ok) return null;

  const payload = (await response.json()) as WikiSummaryResponse;
  const imageUrl = payload?.thumbnail?.source || null;
  return isUsableImageUrl(imageUrl) ? imageUrl : null;
}

export async function getLocationImageUrl(params: {
  destination: string;
  title: string;
  type: "food" | "landmark" | "transit";
}): Promise<string> {
  const destination = normalizeSearchQuery(params.destination);
  const title = normalizeSearchQuery(params.title);
  const typeLabel =
    params.type === "food"
      ? "restaurant"
      : params.type === "transit"
        ? "transport"
        : "landmark";

  const placeHints = extractPlaceHintsFromTitle(title);

  const specificQueries = dedupeQueries(
    placeHints.flatMap((hint) => [
      destination ? `${hint} ${destination}` : hint,
      hint,
      `${hint} ${typeLabel}`
    ])
  );

  const genericQueries = dedupeQueries([
    `${destination} ${typeLabel}`,
    `${destination} tourism`,
    `${destination} travel`,
    destination
  ]);

  for (const query of specificQueries) {
    try {
      const image = await searchWikipediaSummaryImage(query);
      if (isUsableImageUrl(image)) return image;
    } catch {
      // Continue with next source.
    }
  }

  for (const query of specificQueries) {
    try {
      const image = await searchWikipediaImage(query);
      if (isUsableImageUrl(image)) return image;
    } catch {
      // Continue with next query or fallback.
    }
  }

  for (const query of genericQueries) {
    try {
      const image = await searchWikipediaSummaryImage(query);
      if (isUsableImageUrl(image)) return image;
    } catch {
      // Continue with next source.
    }
  }

  for (const query of genericQueries) {
    try {
      const image = await searchWikipediaImage(query);
      if (isUsableImageUrl(image)) return image;
    } catch {
      // Continue with next query or fallback.
    }
  }

  return getFallbackImage(`${title || destination} Trip`);
}
