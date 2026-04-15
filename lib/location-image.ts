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

function getPlaceholdImage(label: string) {
  return `https://placehold.co/480x320/png?text=${encodeURIComponent(label)}`;
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
  url.searchParams.set("gsrlimit", "1");
  url.searchParams.set("prop", "pageimages");
  url.searchParams.set("piprop", "thumbnail");
  url.searchParams.set("pithumbsize", "800");

  const response = await fetchWithTimeout(url.toString(), 7000);
  if (!response.ok) return null;

  const payload = (await response.json()) as WikiResponse;
  const pages = payload?.query?.pages;
  if (!pages) return null;

  const firstPage = Object.values(pages)[0];
  const imageUrl = firstPage?.thumbnail?.source;
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
  return payload?.thumbnail?.source || null;
}

export async function getLocationImageUrl(params: {
  destination: string;
  title: string;
  type: "food" | "landmark" | "transit";
}) {
  const destination = params.destination?.trim() || "";
  const title = params.title?.trim() || "";
  const typeLabel =
    params.type === "food"
      ? "restaurant"
      : params.type === "transit"
        ? "transport"
        : "landmark";

  const queries = [
    `${title} ${destination}`,
    `${title}`,
    `${destination} ${typeLabel}`,
    `${destination} tourism`
  ].filter(Boolean);

  for (const query of queries) {
    try {
      const image = await searchWikipediaSummaryImage(query);
      if (image) return image;
    } catch {
      // Continue with next source.
    }
  }

  for (const query of queries) {
    try {
      const image = await searchWikipediaImage(query);
      if (image) return image;
    } catch {
      // Continue with next query or fallback.
    }
  }

  return getPlaceholdImage(`${title} - ${destination}`);
}
