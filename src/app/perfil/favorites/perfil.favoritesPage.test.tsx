import { describe, it, beforeEach, vi, expect } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import FavoritesPage from "@/app/perfil/favorites/page";

describe("FavoritesPage", () => {
  const mockUser = { id: "123", email: "test@example.com" };
  const mockFavorites = ["book1", "book2"];
  const mockBooks = [
    { id: "book1", volumeInfo: { title: "Libro 1", imageLinks: { thumbnail: "thumb1.jpg" } } },
    { id: "book2", volumeInfo: { title: "Libro 2", imageLinks: { thumbnail: "thumb2.jpg" } } },
  ];

  beforeEach(() => {
    vi.restoreAllMocks();
    vi.stubGlobal("fetch", vi.fn());
  });

  it("muestra mensaje de carga inicialmente", () => {
    render(<FavoritesPage />);
    expect(screen.getByText(/Cargando favoritos/i)).toBeDefined();
  });

  it("muestra mensaje si no hay usuario", async () => {
    (fetch as any).mockResolvedValueOnce({ ok: false });
    render(<FavoritesPage />);
    await waitFor(() =>
      expect(screen.getByText(/Necesitas estar logueado/i)).toBeDefined()
    );
  });

  it("muestra mensaje si no hay favoritos", async () => {
    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ user: mockUser, favorites: [] }),
    });

    render(<FavoritesPage />);
    await waitFor(() =>
      expect(screen.getByText(/No has agregado libros a favoritos/i)).toBeDefined()
    );
  });

  it("muestra los libros favoritos correctamente", async () => {
    // Mock /api/users/favorites
    (fetch as any)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ user: mockUser, favorites: mockFavorites }),
      })
      // Mock Google Books API
      .mockResolvedValueOnce({ ok: true, json: async () => mockBooks[0] })
      .mockResolvedValueOnce({ ok: true, json: async () => mockBooks[1] });

    render(<FavoritesPage />);

    await waitFor(() =>
      expect(screen.getByText(/Tus libros favoritos/i)).toBeDefined()
    );

    for (const b of mockBooks) {
      expect(screen.getByText(b.volumeInfo.title)).toBeDefined();
    }
  });
});
