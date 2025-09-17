import { NextResponse } from "next/server";

export async function POST() {
  // Para eliminar la cookie, la reseteamos con un valor vacío y fecha de expiración en el pasado
  const response = NextResponse.json(
    { message: "Sesión cerrada correctamente" },
    { status: 200 }
  );

  response.cookies.set("br_auth", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(0), // Expira inmediatamente
  });

  return response;
}
