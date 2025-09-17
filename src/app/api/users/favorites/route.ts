import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/user";
import jwt from "jsonwebtoken";

// Obtener los favoritos del usuario autenticado
export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get(process.env.COOKIE_NAME || "br_auth")?.value;
    if (!token) return NextResponse.json({ user: null, favorites: [] }, { status: 401 });

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };
    await connectToDatabase();

    const user = await User.findById(decoded.id);
    if (!user) return NextResponse.json({ user: null, favorites: [] }, { status: 404 });

    // Retornamos solo los IDs por ahora
    return NextResponse.json({ user: { id: user._id, email: user.email }, favorites: user.favorites || [] });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ user: null, favorites: [] }, { status: 500 });
  }
}

// Toggle favorite: si el libro ya está en favoritos, lo quita; si no, lo agrega
export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get(process.env.COOKIE_NAME || "br_auth")?.value;
    if (!token) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };
    const { bookId, bookTitle } = await req.json();

    if (!bookId) return NextResponse.json({ error: "bookId es requerido" }, { status: 400 });

    await connectToDatabase();

    const user = await User.findById(decoded.id);
    if (!user) return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });

    // Si ya está en favoritos, lo quitamos
    if (user.favorites?.includes(bookId)) {
      user.favorites = user.favorites.filter((b) => b !== bookId);
    } else {
      user.favorites = [...(user.favorites || []), bookId];
    }

    await user.save();
    return NextResponse.json({ ok: true, favorites: user.favorites });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
