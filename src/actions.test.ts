import { describe, expect, it, vi, beforeEach, Mock } from "vitest";

// Simulamos las dependencias
vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("uuid", () => ({
  v4: vi.fn(() => "mock-uuid-123"),
}));

vi.mock("@/lib/storage", () => ({
  addReview: vi.fn(),
  voteReview: vi.fn(),
}));

import { search, submitReview, vote } from "@/actions";
import { Review } from "@/lib/types";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { addReview, voteReview } from "@/lib/storage";

const addReviewMock = addReview as Mock;
const voteReviewMock = voteReview as Mock;

describe("Server Actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("search debería redirigir con una consulta válida", () => {
    const formData = new FormData();
    formData.append("q", "harry potter");
    search(formData);
    expect(redirect).toHaveBeenCalledWith("/search?q=harry%20potter");
  });

  it("search no debería redirigir si la consulta está vacía o tiene solo espacios", () => {
    const formData = new FormData();
    formData.append("q", "   ");
    search(formData);
    expect(redirect).not.toHaveBeenCalled();
  });

  it("search no debería redirigir si la consulta es null", () => {
    const formData = new FormData();
    search(formData);
    expect(redirect).not.toHaveBeenCalled();
  });

  it("submitReview debería agregar una reseña y revalidar la ruta", async () => {
    const formData = new FormData();
    formData.append("bookId", "book456");
    formData.append("stars", "3");
    formData.append("text", "Un poco aburrido, pero se deja leer.");

    await submitReview(formData);

    const expectedReview: Review = {
      id: "mock-uuid-123",
      bookId: "book456",
      stars: 3,
      text: "Un poco aburrido, pero se deja leer.",
      votes: 0,
      createdAt: expect.any(Number),
    };

    expect(addReview).toHaveBeenCalledWith(expectedReview);
    expect(revalidatePath).toHaveBeenCalledWith("/book/book456");
  });

  it("submitReview no debería hacer nada si el texto está vacío o tiene solo espacios", async () => {
    const formData = new FormData();
    formData.append("bookId", "book456");
    formData.append("stars", "3");
    formData.append("text", "   ");

    await submitReview(formData);
    expect(addReview).not.toHaveBeenCalled();
  });

  it("submitReview no falla si stars es inválido o null", async () => {
    const formData = new FormData();
    formData.append("bookId", "book456");
    formData.append("text", "Buen libro");

    await submitReview(formData);
    const call = addReviewMock.mock.calls[0][0];
    expect(call.stars).toBe(0);
  });

  it("submitReview no falla si bookId es null", async () => {
    const formData = new FormData();
    formData.append("stars", "5");
    formData.append("text", "Excelente");

    await submitReview(formData);
    const call = addReviewMock.mock.calls[0][0];
    expect(call.bookId).toBeNull();
  });

  it("vote debería llamar a voteReview y revalidar la ruta", async () => {
    const bookId = "book789";
    const reviewId = "review-abc";
    const delta = 1;
    await vote(reviewId, delta, bookId);

    expect(voteReview).toHaveBeenCalledWith(bookId, reviewId, delta);
    expect(revalidatePath).toHaveBeenCalledWith("/book/book789");
  });

  it("vote no falla si bookId o reviewId son null/undefined", async () => {
    await vote(undefined as any, 1, undefined as any);
    expect(voteReview).toHaveBeenCalledWith(undefined, undefined, 1);
  });
});
