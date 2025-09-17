import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ReviewSection from "@/components/ui/ReviewSection";

// Mock global de fetch
vi.stubGlobal("fetch", vi.fn());

beforeEach(() => {
  vi.resetAllMocks();
});

// Helper para mockear fetch con respuestas ordenadas
const mockFetch = (responses: { ok: boolean; json: any }[]) => {
  let calls = [...responses];
  (fetch as any).mockImplementation(() => {
    const response = calls.shift();
    if (!response) {
      // fallback si se llama más veces de lo esperado
      return Promise.resolve({ ok: true, json: async () => ({}) });
    }
    return Promise.resolve({
      ok: response.ok,
      json: async () => response.json,
    });
  });
};

describe("ReviewSection", () => {
  const mockUser = { id: "u1", email: "test@example.com" };
  const mockReviews = [
    {
      _id: "r1",
      bookId: "b1",
      user: { _id: "u1", email: "test@example.com" },
      stars: 4,
      text: "Muy bueno",
      votes: 3,
      createdAt: Date.now(),
    },
    {
      _id: "r2",
      bookId: "b1",
      user: { _id: "u2", email: "otro@example.com" },
      stars: 5,
      text: "Excelente",
      votes: 5,
      createdAt: Date.now(),
    },
  ];

  it("renderiza mensaje de login si no hay usuario", async () => {
    mockFetch([{ ok: true, json: { user: null } }]);

    render(<ReviewSection bookId="b1" />);
    await waitFor(() =>
      expect(
        screen.getByText("Inicia sesión para ver y dejar una reseña")
      ).toBeInTheDocument()
    );
  });

  it("renderiza reseñas y promedio con usuario logueado", async () => {
    mockFetch([
      { ok: true, json: { user: mockUser } }, // GET /api/auth/me
      { ok: true, json: { reviews: mockReviews } }, // GET /api/reviews
    ]);

    render(<ReviewSection bookId="b1" />);

    await waitFor(() =>
      expect(screen.getByPlaceholderText("¿Qué te pareció el libro?")).toBeInTheDocument()
    );

    expect(screen.getByText("Promedio comunidad:")).toBeInTheDocument();
    expect(screen.getByText(/2 reseñas/)).toBeInTheDocument();
    expect(screen.getByText("Muy bueno")).toBeInTheDocument();
    expect(screen.getByText("Excelente")).toBeInTheDocument();
  });

  it("puede crear una reseña", async () => {
    mockFetch([
      { ok: true, json: { user: mockUser } },
      { ok: true, json: { reviews: [] } }, // fetchReviews inicial
      { ok: true, json: {} }, // POST /api/reviews
      { ok: true, json: { reviews: mockReviews } }, // fetchReviews tras crear
    ]);

    render(<ReviewSection bookId="b1" />);
    await waitFor(() =>
      expect(screen.getByPlaceholderText("¿Qué te pareció el libro?")).toBeInTheDocument()
    );

    fireEvent.change(screen.getByPlaceholderText("¿Qué te pareció el libro?"), {
      target: { value: "Nueva reseña" },
    });
    fireEvent.click(screen.getByText("Publicar"));

    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(4));
  });

  it("no crea reseña si texto vacío o usuario null", async () => {
    mockFetch([{ ok: true, json: { user: null } }]);

    render(<ReviewSection bookId="b1" />);
    const btn = screen.queryByText("Publicar");
    expect(btn).not.toBeInTheDocument();
  });

  it("puede editar y cancelar edición", async () => {
    mockFetch([
      { ok: true, json: { user: mockUser } },
      { ok: true, json: { reviews: mockReviews } },
    ]);

    render(<ReviewSection bookId="b1" />);
    await waitFor(() => screen.getByText("Muy bueno"));

    fireEvent.click(screen.getAllByText("Editar")[0]);
    const textarea = screen.getByLabelText("Editar reseña") as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: "Editada" } });
    expect(textarea.value).toBe("Editada");

    fireEvent.click(screen.getByText("Cancelar"));
    expect(screen.queryByLabelText("Editar reseña")).toBeNull();
  });

  it("puede eliminar reseña tras confirm", async () => {
    vi.stubGlobal("confirm", () => true);

    mockFetch([
      { ok: true, json: { user: mockUser } },
      { ok: true, json: { reviews: mockReviews } },
      { ok: true, json: {} }, // DELETE
      { ok: true, json: { reviews: [] } }, // fetchReviews tras delete
    ]);

    render(<ReviewSection bookId="b1" />);
    await waitFor(() => screen.getByText("Muy bueno"));

    fireEvent.click(screen.getAllByText("Eliminar")[0]);
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(4));
  });

  it("puede votar reseña", async () => {
    mockFetch([
      { ok: true, json: { user: mockUser } },
      { ok: true, json: { reviews: mockReviews } },
      { ok: true, json: {} }, // vote
      { ok: true, json: { reviews: mockReviews } }, // fetchReviews tras vote
    ]);

    render(<ReviewSection bookId="b1" />);
    await waitFor(() => screen.getByText("Muy bueno"));

    fireEvent.click(screen.getAllByText("👍")[0]);
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(4));
  });
});
