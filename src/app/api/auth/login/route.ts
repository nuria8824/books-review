import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models/user";
import { verifyPassword, signToken } from "@/lib/auth";
import { z } from "zod";

const schema = z.object({ email: z.string().email(), password: z.string() });

export async function POST(req: Request) {
  // Parsear body
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  // Conectar a la DB
  await connectToDatabase();

  const { email, password } = parsed.data;
  const user = await User.findOne({ email });
  if (!user) return NextResponse.json({ error: "invalid" }, { status: 401 });

  // Verificar contraseña
  const ok = await verifyPassword(user.passwordHash, password);
  if (!ok) return NextResponse.json({ error: "invalid" }, { status: 401 });

  // Generar JWT
  const token = signToken({ id: user._id, email: user.email });

  // Responder y guardar cookie HTTP-only
  const res = NextResponse.json({
    ok: true,
    user: { id: user._id, email: user.email },
  });

  res.cookies.set(process.env.COOKIE_NAME || "br_auth", token, {
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 7, // 7 días
    path: "/",
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
  });

  return res;
}
