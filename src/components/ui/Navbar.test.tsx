import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import Navbar from "@/components/ui/Navbar";
import * as UserContext from "@/context/UserContext";

// Mock fetch global
vi.stubGlobal("fetch", vi.fn());

describe("Navbar", () => {
  const mockSetUser = vi.fn();

  beforeEach(() => {
    vi.resetAllMocks();
    // Mock del contexto
    vi.spyOn(UserContext, "useUser").mockReturnValue({
      user: null,
      setUser: mockSetUser,
    } as any);
  });

  it("muestra links de login/registro si no hay usuario", () => {
    render(<Navbar />);
    expect(screen.getByText("Registrarse")).toBeInTheDocument();
    expect(screen.getByText("Login")).toBeInTheDocument();
    expect(screen.queryByText("Perfil")).not.toBeInTheDocument();
  });

  it("muestra link de perfil si hay usuario", () => {
    vi.spyOn(UserContext, "useUser").mockReturnValue({
      user: { id: "u1", email: "test@example.com" },
      setUser: mockSetUser,
    } as any);

    render(<Navbar />);
    expect(screen.getByText("Perfil")).toBeInTheDocument();
    expect(screen.queryByText("Registrarse")).not.toBeInTheDocument();
    expect(screen.queryByText("Login")).not.toBeInTheDocument();
  });

  it("llama a /api/auth/me y setea el usuario si la respuesta es OK", async () => {
    (fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({ user: { id: "u1", email: "test@example.com" } }),
    });

    render(<Navbar />);

    await waitFor(() => expect(fetch).toHaveBeenCalledWith(
      "/api/auth/me",
      expect.objectContaining({ method: "GET", credentials: "include" })
    ));

    await waitFor(() => expect(mockSetUser).toHaveBeenCalledWith({ id: "u1", email: "test@example.com" }));
  });

  it("setea user null si la respuesta de /api/auth/me no es OK", async () => {
    (fetch as any).mockResolvedValue({ ok: false });

    render(<Navbar />);

    await waitFor(() => expect(mockSetUser).toHaveBeenCalledWith(null));
  });

  it("setea user null si hay error de red", async () => {
    (fetch as any).mockRejectedValue(new Error("Network error"));

    render(<Navbar />);

    await waitFor(() => expect(mockSetUser).toHaveBeenCalledWith(null));
  });
});
