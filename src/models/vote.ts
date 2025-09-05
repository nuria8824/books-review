import mongoose, { Schema, Document, Model } from "mongoose";

export interface IVote extends Document {
  review: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  delta: 1 | -1;
  createdAt: Date;
}

const VoteSchema = new Schema<IVote>({
  review: { type: Schema.Types.ObjectId, ref: "Review", required: true },
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  delta: { type: Number, enum: [1, -1], required: true },
  createdAt: { type: Date, default: Date.now },
});

VoteSchema.index({ review: 1, user: 1 }, { unique: true }); // cada usuario solo un voto por review

export const Vote: Model<IVote> = mongoose.models.Vote || mongoose.model<IVote>("Vote", VoteSchema);
