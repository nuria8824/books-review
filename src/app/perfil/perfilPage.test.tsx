import { describe, it, beforeEach, vi, expect } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import PerfilPage from "@/app/perfil/page";

describe("PerfilPage", () => {
  const mockUser = { id: "123", email: "test@example.com" };
  const mockReviews = [
    {
      _id: "r1",
      bookId: "b1",
      bookTitle: "Libro 1",
      bookThumbnail: "thumb1.jpg",
      stars: 5,
      text: "Excelente",
      votes: 10,
      createdAt: 1690000000000,
    },
    {
      _id: "r2",
      bookId: "b2",
      bookTitle: "Libro 2",
      stars: 3,
      text: "Regular",
      votes: 2,
      createdAt: 1690005000000,
    },
  ];

  beforeEach(() => {
    vi.restoreAllMocks();
    vi.stubGlobal("fetch", vi.fn());
  });

  it("muestra mensaje de carga inicialmente", () => {
    render(<PerfilPage />);
    expect(screen.getByText(/Cargando perfil/i)).toBeDefined();
  });

  it("muestra modal si no hay usuario", async () => {
    (fetch as any).mockResolvedValueOnce({ ok: false });
    render(<PerfilPage />);
    await waitFor(() =>
      expect(screen.getByText(/Necesitas una cuenta/i)).toBeDefined()
    );
  });

  it("muestra usuario y reseñas correctamente", async () => {
    // Mock fetch para /api/auth/me
    (fetch as any)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ user: mockUser }),
      })
      // Mock fetch para /api/users/:id/reviews
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ reviews: mockReviews }),
      });

    render(<PerfilPage />);

    await waitFor(() =>
      expect(screen.getByText(/Perfil de Usuario/i)).toBeDefined()
    );

    expect(screen.getByText(mockUser.id)).toBeDefined();
    expect(screen.getByText(mockUser.email)).toBeDefined();

    // Reseñas
    for (const r of mockReviews) {
      expect(screen.getByText(r.bookTitle!)).toBeDefined();
      expect(screen.getByText(r.text)).toBeDefined();
      expect(screen.getByText(`Puntos: ${r.votes}`)).toBeDefined();
    }
  });

  it("calcula promedio de estrellas correctamente", async () => {
    (fetch as any)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ user: mockUser }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ reviews: mockReviews }),
      });

    render(<PerfilPage />);

    await waitFor(() =>
      expect(screen.getByText(/Promedio de calificaciones/i)).toBeDefined()
    );

    // Promedio = (5 + 3)/2 = 4
    expect(screen.getByText("4.0 (2 reseñas)")).toBeDefined();
  });
});
