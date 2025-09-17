import argon2 from "argon2";
import jwt from "jsonwebtoken";
import { serialize, parse } from "cookie";

const JWT_SECRET = process.env.JWT_SECRET!;
const COOKIE_NAME = process.env.COOKIE_NAME || "br_auth";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 días

export async function hashPassword(password: string) {
  return argon2.hash(password);
}

export async function verifyPassword(hash: string, password: string) {
  return argon2.verify(hash, password);
}

export function signToken(payload: object) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

export function setTokenCookie(res: any, token: string) {
  const cookie = serialize(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  });
  res.headers.set("set-cookie", cookie); // Next.js app router Response handling may differ
}

export function parseCookies(req: any) {
  const cookieHeader = req.headers.get("cookie") || "";
  return parse(cookieHeader);
}
