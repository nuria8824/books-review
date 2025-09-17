import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/user";
import { requireAuth } from "@/lib/authMiddleware";

// Obtener los favoritos del usuario autenticado
export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    let user;
    try {
      user = requireAuth(req);
    } catch {
      return NextResponse.json({ user: null, favorites: [] }, { status: 401 });
    }

    const dbUser = await User.findById(user.id);
    if (!dbUser) return NextResponse.json({ user: null, favorites: [] }, { status: 404 });

    // Retornamos solo los IDs por ahora
    return NextResponse.json({ user: { id: dbUser._id, email: user.email }, favorites: dbUser.favorites || [] });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ user: null, favorites: [] }, { status: 500 });
  }
}

// Toggle favorite: si el libro ya está en favoritos, lo quita; si no, lo agrega
export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();

    let user;
    try {
      user = requireAuth(req);
    } catch {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { bookId } = await req.json();
    if (!bookId) return NextResponse.json({ error: "bookId es requerido" }, { status: 400 });

    const dbUser = await User.findById(user.id);
    if (!dbUser) return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });

    // Si ya está en favoritos, lo quitamos
    if (dbUser.favorites?.includes(bookId)) {
      dbUser.favorites = dbUser.favorites.filter((b) => b !== bookId);
    } else {
      dbUser.favorites = [...(dbUser.favorites || []), bookId];
    }

    await dbUser.save();
    return NextResponse.json({ ok: true, favorites: dbUser.favorites });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
