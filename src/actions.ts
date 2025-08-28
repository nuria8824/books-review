"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { v4 as uuid } from "uuid";
import { addReview, voteReview } from "@/lib/storage";

export async function search(formData: FormData) {
  const q = formData.get("q") as string;
  if (q && q.trim()) {
    redirect(`/search?q=${encodeURIComponent(q.trim())}`);
  }
}

export async function submitReview(formData: FormData) {
  const bookId = formData.get("bookId") as string;
  const stars = Number(formData.get("stars")) as 1 | 2 | 3 | 4 | 5;
  const text = formData.get("text") as string;

  if (!text.trim()) return;

  const r = {
    id: uuid(),
    bookId,
    stars,
    text: text.trim(),
    votes: 0,
    createdAt: Date.now(),
  };

  addReview(r);
  revalidatePath(`/book/${bookId}`);
}

export async function vote(id: string, delta: 1 | -1, bookId: string) {
  voteReview(bookId, id, delta);
  revalidatePath(`/book/${bookId}`);
}