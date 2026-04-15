import { NextRequest, NextResponse } from "next/server";
import { randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";

export const runtime = "nodejs";

type AuthMode = "signin" | "signup" | "google";

type AuthRequest = {
  mode?: AuthMode;
  email?: string;
  password?: string;
  name?: string;
  country?: string;
};

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function sanitizeProfileText(value: string, fallback = "") {
  const normalized = String(value || "").trim();
  return normalized.length > 0 ? normalized : fallback;
}

function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hashed = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hashed}`;
}

function verifyPassword(password: string, stored: string) {
  const [salt, key] = String(stored || "").split(":");
  if (!salt || !key) return false;

  try {
    const derivedKey = scryptSync(password, salt, 64);
    const keyBuffer = Buffer.from(key, "hex");
    if (derivedKey.length !== keyBuffer.length) return false;
    return timingSafeEqual(derivedKey, keyBuffer);
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as AuthRequest;
    const mode: AuthMode =
      body.mode === "signup" || body.mode === "google" ? body.mode : "signin";
    const email = normalizeEmail(String(body.email || ""));
    const password = String(body.password || "");
    const name = sanitizeProfileText(String(body.name || ""));
    const country = sanitizeProfileText(String(body.country || ""));

    if (!email || !isValidEmail(email)) {
      return NextResponse.json({ error: "Valid email is required." }, { status: 400 });
    }

    if (mode !== "google" && password.trim().length === 0) {
      return NextResponse.json({ error: "Password is required." }, { status: 400 });
    }

    if (mode === "signup" && !name) {
      return NextResponse.json({ error: "Name is required for sign up." }, { status: 400 });
    }

    if (mode === "signup" && !country) {
      return NextResponse.json(
        { error: "Country is required for sign up." },
        { status: 400 }
      );
    }

    if (mode === "signup" && password.trim().length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters." },
        { status: 400 }
      );
    }

    const [existingUser] = await db
      .select({
        id: users.id,
        email: users.email,
        passwordHash: users.passwordHash,
        name: users.name,
        country: users.country
      })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (mode === "signin") {
      if (!existingUser) {
        return NextResponse.json(
          { error: "No account found for this email. Please sign up first." },
          { status: 404 }
        );
      }

      if (!existingUser.passwordHash) {
        return NextResponse.json(
          {
            error:
              "This account has no password yet. Please click Sign up once with the same email to set a password."
          },
          { status: 409 }
        );
      }

      if (!verifyPassword(password, existingUser.passwordHash)) {
        return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
      }

      return NextResponse.json(
        {
          success: true,
          mode,
          user: {
            id: existingUser.id,
            email: existingUser.email,
            name: existingUser.name || "",
            country: existingUser.country || ""
          }
        },
        { status: 200 }
      );
    }

    if (mode === "signup") {
      const passwordHash = hashPassword(password);

      if (existingUser) {
        if (existingUser.passwordHash) {
          return NextResponse.json(
            { error: "Account already exists. Please sign in." },
            { status: 409 }
          );
        }

        const [updatedUser] = await db
          .update(users)
          .set({ passwordHash, name, country })
          .where(eq(users.id, existingUser.id))
          .returning({
            id: users.id,
            email: users.email,
            name: users.name,
            country: users.country
          });

        return NextResponse.json(
          { success: true, mode, user: updatedUser },
          { status: 200 }
        );
      }

      const [createdUser] = await db
        .insert(users)
        .values({ email, passwordHash, name, country })
        .returning({
          id: users.id,
          email: users.email,
          name: users.name,
          country: users.country
        });

      return NextResponse.json(
        { success: true, mode, user: createdUser },
        { status: 201 }
      );
    }

    if (existingUser) {
      return NextResponse.json(
        {
          success: true,
          mode,
          user: {
            id: existingUser.id,
            email: existingUser.email,
            name: existingUser.name || "",
            country: existingUser.country || ""
          }
        },
        { status: 200 }
      );
    }

    const [googleUser] = await db
      .insert(users)
      .values({
        email,
        passwordHash: "",
        name: name || email.split("@")[0] || "Traveler",
        country: country || ""
      })
      .returning({
        id: users.id,
        email: users.email,
        name: users.name,
        country: users.country
      });

    return NextResponse.json({ success: true, mode, user: googleUser }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown auth error";
    return NextResponse.json(
      {
        error: "Authentication failed.",
        details: message
      },
      { status: 500 }
    );
  }
}
