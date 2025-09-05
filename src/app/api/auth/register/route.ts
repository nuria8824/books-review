import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models/user";
import { hashPassword, signToken } from "@/lib/auth";
import { z } from "zod";

const bodySchema = z.object({ email: z.string().email(), password: z.string().min(6), name: z.string().optional() });

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "invalid" }, { status: 400 });

  await connectToDatabase();
  const { email, password, name } = parsed.data;
  const existing = await User.findOne({ email });
  if (existing) return NextResponse.json({ error: "exists" }, { status: 409 });

  const passwordHash = await hashPassword(password);
  const user = await User.create({ email, passwordHash, name });

  const token = signToken({ id: user._id, email: user.email });
  const res = NextResponse.json({ ok: true, user: { id: user._id, email: user.email, name: user.name } });
  res.cookies.set(process.env.COOKIE_NAME || "br_auth", token, { httpOnly: true, maxAge: 60*60*24*7, path: "/" });
  return res;
}
