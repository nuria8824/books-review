import mongoose, { Schema, Document, Model } from "mongoose";

export interface IFavorite extends Document {
  user: mongoose.Types.ObjectId;
  bookId: string;
  createdAt: Date;
}

const FavoriteSchema = new Schema<IFavorite>({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  bookId: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

FavoriteSchema.index({ user: 1, bookId: 1 }, { unique: true });

export const Favorite: Model<IFavorite> = mongoose.models.Favorite || mongoose.model<IFavorite>("Favorite", FavoriteSchema);
