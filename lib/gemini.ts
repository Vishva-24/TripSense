import { GoogleGenerativeAI } from "@google/generative-ai";

let geminiClient: GoogleGenerativeAI | null = null;

function getGeminiClient() {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is missing. Add it to .env.local");
  }

  if (!geminiClient) {
    geminiClient = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }

  return geminiClient;
}

function stripCodeFences(rawText: string) {
  return rawText
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```/, "")
    .replace(/```$/, "")
    .trim();
}

export function parseGeminiJson<T>(rawText: string): T {
  const cleaned = stripCodeFences(rawText);

  try {
    return JSON.parse(cleaned) as T;
  } catch {
    throw new Error("Gemini returned invalid JSON");
  }
}

function isModelNotFoundError(error: unknown) {
  if (!(error instanceof Error)) return false;

  const message = error.message.toLowerCase();
  return (
    message.includes("404") ||
    message.includes("not found") ||
    message.includes("is not supported for generatecontent")
  );
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error || "");
}

function getErrorStatusCode(error: unknown) {
  const message = getErrorMessage(error);
  const match = message.match(/\[(\d{3})\s*[A-Za-z ]*\]/) || message.match(/\b(\d{3})\b/);
  return match ? Number(match[1]) : null;
}

function isTransientGeminiError(error: unknown) {
  const statusCode = getErrorStatusCode(error);
  const message = getErrorMessage(error).toLowerCase();

  if (statusCode && [429, 500, 502, 503, 504].includes(statusCode)) return true;

  return (
    message.includes("service unavailable") ||
    message.includes("high demand") ||
    message.includes("temporarily unavailable") ||
    message.includes("try again later") ||
    message.includes("timeout")
  );
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getCandidateModels() {
  const configuredModel = process.env.GEMINI_MODEL?.trim();

  const candidates = [
    configuredModel,
    "gemini-2.5-flash-lite",
    "gemini-2.5-flash",
    "gemini-flash-latest",
    "gemini-2.0-flash"
  ].filter(Boolean) as string[];

  return Array.from(new Set(candidates));
}

export async function generateStructuredJson<T>({
  prompt,
  temperature = 0.25
}: {
  prompt: string;
  temperature?: number;
}): Promise<T> {
  const client = getGeminiClient();
  const candidateModels = getCandidateModels();
  const maxAttemptsPerModel = 3;
  let lastError: unknown = null;

  for (const modelName of candidateModels) {
    for (let attempt = 1; attempt <= maxAttemptsPerModel; attempt += 1) {
      try {
        const model = client.getGenerativeModel({
          model: modelName
        });

        const result = await model.generateContent({
          contents: [
            {
              role: "user",
              parts: [{ text: prompt }]
            }
          ],
          generationConfig: {
            temperature,
            responseMimeType: "application/json"
          }
        });

        return parseGeminiJson<T>(result.response.text());
      } catch (error) {
        lastError = error;

        if (isModelNotFoundError(error)) {
          break;
        }

        const transientError = isTransientGeminiError(error);
        const canRetryThisModel = transientError && attempt < maxAttemptsPerModel;

        if (canRetryThisModel) {
          const backoffMs = 700 * 2 ** (attempt - 1) + Math.floor(Math.random() * 250);
          await sleep(backoffMs);
          continue;
        }

        if (transientError) {
          break;
        }

        throw error;
      }
    }
  }

  const configuredModel = process.env.GEMINI_MODEL?.trim();
  const fallbackMessage =
    configuredModel && configuredModel.length > 0
      ? `Configured GEMINI_MODEL "${configuredModel}" is unavailable.`
      : "No working Gemini model found.";

  throw new Error(
    `${fallbackMessage} Tried models: ${candidateModels.join(", ")}. ${lastError instanceof Error ? lastError.message : ""}`.trim()
  );
}
