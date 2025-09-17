import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import FavoriteButton from "@/components/ui/FavoriteButton";

vi.stubGlobal("fetch", vi.fn());

describe("FavoriteButton", () => {
  const bookId = "book1";

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("no renderiza si userLoggedIn es false", () => {
    render(<FavoriteButton bookId={bookId} userLoggedIn={false} />);
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("fetch inicial setea isFavorite correctamente", async () => {
    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ favorites: [bookId] }),
    });

    render(<FavoriteButton bookId={bookId} userLoggedIn={true} />);
    await waitFor(() => {
      expect(screen.getByRole("button")).toHaveTextContent("💔 Quitar de favoritos");
    });
  });

  it("fetch inicial con libro no favorito", async () => {
    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ favorites: [] }),
    });

    render(<FavoriteButton bookId={bookId} userLoggedIn={true} />);
    await waitFor(() => {
      expect(screen.getByRole("button")).toHaveTextContent("❤️ Agregar a favoritos");
    });
  });

  it("toggle favorite cambia estado y llama API", async () => {
    // fetch inicial
    (fetch as any)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ favorites: [] }),
      })
      // toggle
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ favorites: [bookId] }),
      });

    render(<FavoriteButton bookId={bookId} userLoggedIn={true} />);
    const button = await screen.findByRole("button");
    expect(button).toHaveTextContent("❤️ Agregar a favoritos");

    fireEvent.click(button);

    await waitFor(() => {
      expect(button).toHaveTextContent("💔 Quitar de favoritos");
    });

    expect(fetch).toHaveBeenCalledTimes(2);
    expect((fetch as any).mock.calls[1][1]?.body).toBe(JSON.stringify({ bookId }));
  });

  it("maneja errores en fetch inicial sin romper el componente", async () => {
    (fetch as any).mockRejectedValueOnce(new Error("fail"));

    render(<FavoriteButton bookId={bookId} userLoggedIn={true} />);
    const button = await waitFor(() => screen.getByRole("button"));
    expect(button).toBeInTheDocument();
    // Estado inicial fallback: no está favorito
    expect(button).toHaveTextContent("❤️ Agregar a favoritos");
  });

  it("maneja errores en toggle sin romper el componente", async () => {
    // fetch inicial
    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ favorites: [] }),
    });

    // toggle error
    (fetch as any).mockRejectedValueOnce(new Error("fail toggle"));

    render(<FavoriteButton bookId={bookId} userLoggedIn={true} />);
    const button = await screen.findByRole("button");

    fireEvent.click(button);

    await waitFor(() => {
      // sigue sin estar favorito por error
      expect(button).toHaveTextContent("❤️ Agregar a favoritos");
    });
  });
});
