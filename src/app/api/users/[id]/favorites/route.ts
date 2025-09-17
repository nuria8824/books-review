// import { NextRequest, NextResponse } from "next/server";
// import { connectToDatabase } from "@/lib/mongodb";
// import User from "@/models/user";

// export async function GET(req: NextRequest, props: { params: Promise<{ id: string }> }) {
//   const params = await props.params;
//   const { id } = params;
//   await connectToDatabase();

//   const user = await User.findById(id).select("favorites");
//   if (!user) return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });

//   return NextResponse.json({ favorites: user.favorites });
// }

// export async function POST(req: NextRequest, props: { params: Promise<{ id: string }> }) {
//   const params = await props.params;
//   const { id } = params;
//   await connectToDatabase();

//   const { bookId } = await req.json();
//   if (!bookId) return NextResponse.json({ error: "bookId es requerido" }, { status: 400 });

//   const user = await User.findById(id);
//   if (!user) return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });

//   if (!user.favorites.includes(bookId)) {
//     user.favorites.push(bookId);
//     await user.save();
//   }

//   return NextResponse.json({ favorites: user.favorites });
// }

// export async function DELETE(req: NextRequest, props: { params: Promise<{ id: string }> }) {
//   const params = await props.params;
//   const { id } = params;
//   await connectToDatabase();

//   const bookId = req.nextUrl.searchParams.get("bookId");
//   if (!bookId) return NextResponse.json({ error: "bookId es requerido" }, { status: 400 });

//   const user = await User.findById(id);
//   if (!user) return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });

//   user.favorites = user.favorites.filter(f => f !== bookId);
//   await user.save();

//   return NextResponse.json({ favorites: user.favorites });
// }
