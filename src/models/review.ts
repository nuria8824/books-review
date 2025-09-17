import mongoose, { Schema, Document, Model } from "mongoose";

export interface IReview extends Document {
  bookId: string;
  bookTitle?: string;
  bookThumbnail?: string;
  user: mongoose.Types.ObjectId;
  stars: number;
  text: string;
  votes: number;
  createdAt: Date;
}

const ReviewSchema = new Schema<IReview>({
  bookId: { type: String, required: true },
  bookTitle: { type: String },
  bookThumbnail: { type: String },
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  stars: { type: Number, required: true },
  text: { type: String, required: true },
  votes: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

const Review: Model<IReview> = mongoose.models.Review || mongoose.model<IReview>("Review", ReviewSchema);

export default Review;
