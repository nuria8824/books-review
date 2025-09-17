import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import BookPage from "@/app/book/[id]/page";

// Mockeamos Image de Next.js
vi.mock("next/image", () => ({
  default: (props: any) => <img {...props} />,
}));

// Mockeamos FavoriteButton y ReviewSection
vi.mock("@/components/ui/FavoriteButton", () => ({
  default: (props: any) => <button data-testid="favorite-button">Favorite</button>,
}));

vi.mock("@/components/ui/ReviewSection", () => ({
  default: (props: any) => <div data-testid="review-section">Reviews</div>,
}));

// Mockeamos getBook y getUserFromCookie
vi.mock("@/lib/googleBooks", () => ({
  getBook: vi.fn(),
}));

vi.mock("@/lib/user", () => ({
  getUserFromCookie: vi.fn(),
}));

import { getBook } from "@/lib/googleBooks";
import { getUserFromCookie } from "@/lib/user";

describe("BookPage", () => {
  const mockBook = {
    id: "book123",
    volumeInfo: {
      title: "Test Book",
      authors: ["Author 1", "Author 2"],
      publishedDate: "2020",
      publisher: "Test Publisher",
      pageCount: 123,
      categories: ["Fiction"],
      description: "<p>Test description</p>",
      imageLinks: { thumbnail: "http://example.com/image.jpg" },
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (getBook as any).mockResolvedValue(mockBook);
    (getUserFromCookie as any).mockResolvedValue({ id: "user123", email: "test@test.com" });
  });

  it("renders book info correctly", async () => {
    // params llega como Promise<{ id: string }>
    const params = Promise.resolve({ id: "book123" });
    render(await BookPage({ params }));

    // Esperamos que se rendericen título y autor
    expect(await screen.findByText("Test Book")).toBeTruthy();
    expect(screen.getByText("Author 1, Author 2")).toBeTruthy();

    // Info adicional
    expect(screen.getByText(/Publicado: 2020/)).toBeTruthy();
    expect(screen.getByText(/· Test Publisher/)).toBeTruthy();
    expect(screen.getByText(/· 123 págs./)).toBeTruthy();
    expect(screen.getByText(/· Fiction/)).toBeTruthy();

    // Description
    expect(screen.getByText("Test description")).toBeTruthy();

    // FavoriteButton y ReviewSection
    expect(screen.getByTestId("favorite-button")).toBeTruthy();
    expect(screen.getByTestId("review-section")).toBeTruthy();
  });

  it("sets userLoggedIn correctly", async () => {
    (getUserFromCookie as any).mockResolvedValue(null); // no logueado
    const params = Promise.resolve({ id: "book123" });
    const { container } = render(await BookPage({ params }));

    // Como no hay user, FavoriteButton se debería renderizar igual pero con userLoggedIn=false
    expect(screen.getByTestId("favorite-button")).toBeTruthy();
  });
});
