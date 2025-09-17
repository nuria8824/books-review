import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

export function middleware(req: NextRequest) {
  const token = req.cookies.get(process.env.COOKIE_NAME || "br_auth")?.value;

  // Proteger rutas bajo /account
  if (req.nextUrl.pathname.startsWith("/account")) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    try {
      jwt.verify(token, process.env.JWT_SECRET!);
    } catch {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  return NextResponse.next();
}

// Opcional: definir qué rutas se aplican
export const config = {
  matcher: ["/account/:path*"], // protege todo lo que empiece con /account
};
