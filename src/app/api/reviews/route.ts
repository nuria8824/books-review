import { NextRequest, NextResponse } from "next/server";
import jwt, { JwtPayload } from "jsonwebtoken";
import { connectToDatabase } from "@/lib/mongodb";
import Review from "@/models/review";

// Definimos el tipo del payload que esperamos en el token
interface AuthPayload extends JwtPayload {
  id: string;
}

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();

    const token = req.headers.get("authorization")?.split(" ")[1];
    if (!token) {
      return NextResponse.json({ error: "Token requerido" }, { status: 401 });
    }

    // Verificamos y casteamos al tipo correcto
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as AuthPayload;

    const userId = decoded.id;
    if (!userId) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 });
    }

    const body = await req.json();
    const { bookId, content, rating } = body;

    if (!bookId || !content || !rating) {
      return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });
    }

    const review = await Review.create({
      bookId,
      content,
      rating,
      userId,
      createdAt: new Date(),
    });

    return NextResponse.json(review, { status: 201 });
  } catch (err) {
    console.error("Error al crear reseña:", err);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
