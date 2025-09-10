import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get(process.env.COOKIE_NAME || "br_auth")?.value;
    if (!token) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: string;
      email: string;
    };

    return NextResponse.json({ user: decoded });
  } catch (error) {
    console.error("Error verificando token:", error);
    return NextResponse.json({ user: null }, { status: 401 });
  }
}
