import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Review from "@/models/review";
import User from "@/models/user";
import mongoose from "mongoose";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  
  const { id } = params;
  await connectToDatabase();

  // Validar ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  const user = await User.findById(id);
  if (!user) return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });

  const reviews = await Review.find({ user: id })
    .populate("user", "email name")
    .sort({ createdAt: -1 });

  return NextResponse.json({ user, reviews });
}
