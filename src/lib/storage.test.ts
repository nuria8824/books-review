import { describe, it, beforeEach, expect, vi } from "vitest";
import { getReviews, addReview, voteReview } from "./storage";
import type { Review } from "./types";

const KEY = "book-reviews-v1";
let store: Record<string, string> = {};

const localStorageMock = {
  getItem: vi.fn((k: string) => store[k] ?? null),
  setItem: vi.fn((k: string, v: string) => { store[k] = v; }),
  removeItem: vi.fn((k: string) => { delete store[k]; }),
  clear: vi.fn(() => { store = {}; }),
  key: vi.fn((index: number) => Object.keys(store)[index] ?? null),
  get length() {
    return Object.keys(store).length;
  },
};

describe("storage", () => {
  beforeEach(() => {
    store = {};
    // Simular entorno de navegador
    global.window = {} as any;
    global.localStorage = localStorageMock;
    vi.clearAllMocks();
  });

  const makeReview = (id: string, votes = 0, stars: 1|2|3|4|5 = 5): Review => ({
    id,
    bookId: "book1",
    text: `Review ${id}`,
    votes,
    stars,
    createdAt: Date.now(),
  });

  it("getReviews devuelve [] si no hay reseñas", () => {
    expect(getReviews("book1")).toEqual([]);
  });

  it("addReview guarda una reseña nueva", () => {
    const review = makeReview("r1");
    addReview(review);

    const saved = JSON.parse(store[KEY]);
    expect(saved["book1"]).toHaveLength(1);
    expect(saved["book1"][0]).toMatchObject(review);
  });

  it("getReviews devuelve las reseñas guardadas", () => {
    const review = makeReview("r1");
    addReview(review);

    const reviews = getReviews("book1");
    expect(reviews).toHaveLength(1);
    expect(reviews[0]).toMatchObject(review);
  });

  it("voteReview incrementa los votos", () => {
    const review = makeReview("r1", 0);
    addReview(review);

    voteReview("book1", "r1", 1);
    const updated = getReviews("book1");
    expect(updated[0].votes).toBe(1);
  });

  it("voteReview decrementa los votos", () => {
    const review = makeReview("r1", 3);
    addReview(review);

    voteReview("book1", "r1", -1);
    const updated = getReviews("book1");
    expect(updated[0].votes).toBe(2);
  });

  it("voteReview no falla si el reviewId no existe", () => {
    const review = makeReview("r1", 0);
    addReview(review);

    voteReview("book1", "no-existe", 1);
    const updated = getReviews("book1");
    expect(updated[0].votes).toBe(0);
  });

  it("getReviews retorna vacío si localStorage tiene JSON corrupto", () => {
    store[KEY] = "{malformed json";
    expect(getReviews("book1")).toEqual([]);
  });

  it("addReview agrega múltiples reseñas manteniendo orden inverso", () => {
    const r1 = makeReview("r1");
    const r2 = makeReview("r2");
    addReview(r1);
    addReview(r2);
    const reviews = getReviews("book1");
    expect(reviews.map(r => r.id)).toEqual(["r2", "r1"]);
  });

  it("voteReview suma y resta múltiples veces correctamente", () => {
    const review = makeReview("r1", 0);
    addReview(review);
    voteReview("book1", "r1", 1);
    voteReview("book1", "r1", 1);
    voteReview("book1", "r1", -1);
    expect(getReviews("book1")[0].votes).toBe(1);
  });
});
