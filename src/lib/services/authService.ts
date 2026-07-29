import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { encrypt, decrypt } from "@/lib/jwt";

export { encrypt, decrypt };

// ─── Session ───────────────────────────────────────────────────────────────

export async function getSession() {
  const cookieStore = await cookies();
  const session = cookieStore.get("session")?.value;
  if (!session) return null;
  return await decrypt(session);
}

export async function setSession(user: {
  id: string;
  phone?: string;
  name?: string | null;
  role: string;
}) {
  const session = await encrypt({
    id: user.id,
    phone: user.phone ?? "",
    name: user.name ?? "",
    role: user.role,
  });
  const cookieStore = await cookies();
  cookieStore.set("session", session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete("session");
}

// ─── Bcrypt Helpers ────────────────────────────────────────────────────────

const SALT_ROUNDS = 12;

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

export async function verifyPassword(plain: string, hashed: string): Promise<boolean> {
  return bcrypt.compare(plain, hashed);
}
