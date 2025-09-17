import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { connectToDatabase } from "./mongodb";
import User from "@/models/user";

export async function getUserFromCookie() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(process.env.COOKIE_NAME || "br_auth")?.value;
    if (!token) return null;

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };
    await connectToDatabase();

    const user = await User.findById(decoded.id) as { _id: any; email: string } | null;
    if (!user) return null;

    return { id: user._id.toString(), email: user.email };
  } catch (err) {
    console.error("Error obteniendo usuario de cookie:", err);
    return null;
  }
}
