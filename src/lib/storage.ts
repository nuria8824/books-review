import type { Review } from "./types";

const KEY = "book-reviews-v1";

function loadAll(): Record<string, Review[]> {
  if (typeof window === "undefined") return {};
  try { return JSON.parse(localStorage.getItem(KEY) || "{}"); }
  catch { return {}; }
}

function saveAll(data: Record<string, Review[]>) {
  localStorage.setItem(KEY, JSON.stringify(data));
}

export function getReviews(bookId: string): Review[] {
  const all = loadAll();
  return all[bookId] || [];
}

export function addReview(review: Review) {
  const all = loadAll();
  const list = all[review.bookId] || [];
  all[review.bookId] = [review, ...list];
  saveAll(all);
}

export function voteReview(bookId: string, reviewId: string, delta: 1|-1) {
  const all = loadAll();
  const list = all[bookId] || [];
  const i = list.findIndex(r => r.id === reviewId);
  if (i >= 0) {
    list[i] = { ...list[i], votes: list[i].votes + delta };
    all[bookId] = [...list];
    saveAll(all);
  }
}