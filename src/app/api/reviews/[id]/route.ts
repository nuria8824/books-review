import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectToDatabase } from "@/lib/mongodb";
import Review from "@/models/review";
import mongoose from "mongoose";

interface AuthPayload {
  id: string;
  email: string;
}

// Middleware de auth
function getUserFromToken(req: NextRequest): AuthPayload | null {
  const token = req.cookies.get(process.env.COOKIE_NAME || "br_auth")?.value;
  if (!token) return null;
  try {
    return jwt.verify(token, process.env.JWT_SECRET!) as AuthPayload;
  } catch {
    return null;
  }
}

// EDITAR reseña
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  await connectToDatabase();
  const user = getUserFromToken(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { text, stars } = await req.json();
  if (!text || !stars) {
    return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });
  }

  const review = await Review.findById(params.id);
  if (!review) return NextResponse.json({ error: "Reseña no encontrada" }, { status: 404 });

  // Validar que la reseña sea del usuario
  if (review.user.toString() !== user.id) {
    return NextResponse.json({ error: "No tienes permiso para editar esta reseña" }, { status: 403 });
  }

  review.text = text;
  review.stars = stars;
  await review.save();

  return NextResponse.json(review);
}

// ELIMINAR reseña
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  await connectToDatabase();
  const user = getUserFromToken(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const review = await Review.findById(params.id);
  if (!review) return NextResponse.json({ error: "Reseña no encontrada" }, { status: 404 });

  // Validar que la reseña sea del usuario
  if (review.user.toString() !== user.id) {
    return NextResponse.json({ error: "No tienes permiso para eliminar esta reseña" }, { status: 403 });
  }

  await review.deleteOne();

  return NextResponse.json({ success: true });
}
