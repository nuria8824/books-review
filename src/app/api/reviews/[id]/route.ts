import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Review from "@/models/review";
import { requireAuth } from "@/lib/authMiddleware";

// EDITAR reseña
export async function PUT(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  await connectToDatabase();

  let user;
  try {
    user = requireAuth(req);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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
export async function DELETE(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  await connectToDatabase();

  let user;
  try {
    user = requireAuth(req);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const review = await Review.findById(params.id);
  if (!review) return NextResponse.json({ error: "Reseña no encontrada" }, { status: 404 });

  // Validar que la reseña sea del usuario
  if (review.user.toString() !== user.id) {
    return NextResponse.json({ error: "No tienes permiso para eliminar esta reseña" }, { status: 403 });
  }

  await review.deleteOne();

  return NextResponse.json({ success: true });
}
