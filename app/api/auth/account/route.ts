import { NextRequest, NextResponse } from "next/server";
import { randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";

export const runtime = "nodejs";

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
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

export async function PATCH(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      currentEmail?: string;
      newEmail?: string;
      name?: string;
      country?: string;
    };

    const currentEmail = normalizeEmail(String(body.currentEmail || ""));
    const newEmail = normalizeEmail(String(body.newEmail || ""));
    const name = String(body.name || "").trim();
    const country = String(body.country || "").trim();

    if (!currentEmail || !newEmail || !isValidEmail(newEmail)) {
      return NextResponse.json(
        { error: "Valid currentEmail and newEmail are required." },
        { status: 400 }
      );
    }

    if (!name) {
      return NextResponse.json({ error: "Name is required." }, { status: 400 });
    }

    if (!country) {
      return NextResponse.json({ error: "Country is required." }, { status: 400 });
    }

    const [existingUser] = await db
      .select({ id: users.id, email: users.email })
      .from(users)
      .where(eq(users.email, currentEmail))
      .limit(1);

    if (!existingUser) {
      return NextResponse.json({ error: "Account not found." }, { status: 404 });
    }

    if (currentEmail !== newEmail) {
      const [alreadyUsed] = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.email, newEmail))
        .limit(1);

      if (alreadyUsed) {
        return NextResponse.json(
          { error: "Email already in use. Try a different email." },
          { status: 409 }
        );
      }
    }

    const [updatedUser] = await db
      .update(users)
      .set({ email: newEmail, name, country })
      .where(eq(users.id, existingUser.id))
      .returning({
        id: users.id,
        email: users.email,
        name: users.name,
        country: users.country
      });

    return NextResponse.json({ success: true, user: updatedUser }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown account error";
    return NextResponse.json(
      { error: "Failed to update account.", details: message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      email?: string;
      currentPassword?: string;
      newPassword?: string;
    };

    const email = normalizeEmail(String(body.email || ""));
    const currentPassword = String(body.currentPassword || "");
    const newPassword = String(body.newPassword || "");

    if (!email || !isValidEmail(email)) {
      return NextResponse.json({ error: "Valid email is required." }, { status: 400 });
    }

    if (newPassword.trim().length < 6) {
      return NextResponse.json(
        { error: "New password must be at least 6 characters." },
        { status: 400 }
      );
    }

    const [existingUser] = await db
      .select({
        id: users.id,
        email: users.email,
        passwordHash: users.passwordHash
      })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!existingUser) {
      return NextResponse.json({ error: "Account not found." }, { status: 404 });
    }

    if (existingUser.passwordHash && !verifyPassword(currentPassword, existingUser.passwordHash)) {
      return NextResponse.json({ error: "Current password is incorrect." }, { status: 401 });
    }

    const [updatedUser] = await db
      .update(users)
      .set({ passwordHash: hashPassword(newPassword) })
      .where(eq(users.id, existingUser.id))
      .returning({ id: users.id, email: users.email });

    return NextResponse.json(
      { success: true, user: updatedUser, message: "Password updated successfully." },
      { status: 200 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown account error";
    return NextResponse.json(
      { error: "Failed to change password.", details: message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = (await request.json()) as { email?: string };
    const email = normalizeEmail(String(body.email || ""));

    if (!email || !isValidEmail(email)) {
      return NextResponse.json({ error: "Valid email is required." }, { status: 400 });
    }

    const [deletedUser] = await db
      .delete(users)
      .where(eq(users.email, email))
      .returning({ id: users.id, email: users.email });

    if (!deletedUser) {
      return NextResponse.json({ error: "Account not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true, user: deletedUser }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown account error";
    return NextResponse.json(
      { error: "Failed to delete account.", details: message },
      { status: 500 }
    );
  }
}
