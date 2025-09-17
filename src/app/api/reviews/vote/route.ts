import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Vote } from "@/models/vote";
import Review from "@/models/review";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("br_auth")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const user = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };

    const { reviewId, delta } = await req.json();
    if (!reviewId || ![1, -1].includes(delta)) return NextResponse.json({ error: "Invalid data" }, { status: 400 });

    await connectToDatabase();
    const existingVote = await Vote.findOne({ review: reviewId, user: user.id });
    if (existingVote) {
      existingVote.delta = delta as 1 | -1;
      await existingVote.save();
    } else {
      await Vote.create({ review: reviewId, user: user.id, delta });
    }

    // Recalcular votos de la review
    const agg = await Vote.aggregate([
      { $match: { review: new mongoose.Types.ObjectId(reviewId) } },
      { $group: { _id: "$review", total: { $sum: "$delta" } } }
    ]);
    const totalVotes = agg[0]?.total || 0;
    await Review.findByIdAndUpdate(reviewId, { votes: totalVotes });

    return NextResponse.json({ ok: true, votes: totalVotes });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
