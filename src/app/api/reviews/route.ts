import { NextRequest, NextResponse } from "next/server";
import jwt, { JwtPayload } from "jsonwebtoken";
import { connectToDatabase } from "@/lib/mongodb";
import Review from "@/models/review";
import mongoose from "mongoose";

// Definimos el tipo del payload que esperamos en el token
interface AuthPayload extends JwtPayload {
  id: string;
}

export async function GET(req: NextRequest) {
  await connectToDatabase();
  const bookId = req.nextUrl.searchParams.get("bookId");
  const filter = bookId ? { bookId } : {};
  const reviews = await Review.find(filter)
    .populate("user", "email name")
    .sort({ createdAt: -1 });
  return NextResponse.json({reviews});
}

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();

    const token = req.cookies.get("br_auth")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verificamos y casteamos al tipo correcto
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as AuthPayload;

    const { bookId, content, rating, bookTitle, bookThumbnail } = await req.json();
    if (!bookId || !content || !rating) {
      return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });
    }

    const review = await Review.create({
      bookId,
      text: content,
      stars: rating,
      user: new mongoose.Types.ObjectId(decoded.id),
      bookTitle,
      bookThumbnail,
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
