// lib/authMiddleware.ts
import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

export interface AuthPayload {
  id: string;
  email: string;
}

export function getUserFromToken(req: NextRequest): AuthPayload | null {
  const token = req.cookies.get(process.env.COOKIE_NAME || "br_auth")?.value;
  if (!token) return null;
  try {
    return jwt.verify(token, process.env.JWT_SECRET!) as AuthPayload;
  } catch {
    return null;
  }
}

// Lanza error si no está logueado, para usarlo en try/catch
export function requireAuth(req: NextRequest): AuthPayload {
  const user = getUserFromToken(req);
  if (!user) throw new Error("Unauthorized");
  return user;
}
