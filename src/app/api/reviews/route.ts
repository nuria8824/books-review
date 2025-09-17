import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Review from "@/models/review";
import mongoose from "mongoose";
import { requireAuth } from "@/lib/authMiddleware";

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

    let user;
    try {
      user = requireAuth(req);
    } catch {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { bookId, content, rating, bookTitle, bookThumbnail } = await req.json();
    if (!bookId || !content || !rating) {
      return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });
    }

    const review = await Review.create({
      bookId,
      text: content,
      stars: rating,
      user: new mongoose.Types.ObjectId(user.id),
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
