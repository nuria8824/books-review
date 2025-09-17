import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import LoginForm from "@/components/ui/LoginForm";
import * as UserContext from "@/context/UserContext";
import { useRouter } from "next/navigation";

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
}));

describe("LoginForm", () => {
  const mockSetUser = vi.fn();
  const mockPush = vi.fn();

  beforeEach(() => {
    vi.resetAllMocks();

    vi.spyOn(UserContext, "useUser").mockReturnValue({
      user: null,
      setUser: mockSetUser,
    } as any);

    (useRouter as any).mockReturnValue({ push: mockPush });
    vi.stubGlobal("fetch", vi.fn());
  });

  it("renderiza correctamente inputs y botón", () => {
    render(<LoginForm />);
    expect(screen.getByPlaceholderText("email")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("password")).toBeInTheDocument();
  });

  it("actualiza los inputs al escribir", () => {
    render(<LoginForm />);
    const emailInput = screen.getByPlaceholderText("email");
    const passwordInput = screen.getByPlaceholderText("password");

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "123456" } });

    expect((emailInput as HTMLInputElement).value).toBe("test@example.com");
    expect((passwordInput as HTMLInputElement).value).toBe("123456");
  });

  it("login exitoso llama a setUser y redirige", async () => {
    (fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({ user: { id: "u1", email: "test@example.com" } }),
    });

    render(<LoginForm />);
    fireEvent.submit(screen.getByRole("button", { name: /Iniciar Sesión/i }));

    await waitFor(() => expect(mockSetUser).toHaveBeenCalledWith({
      id: "u1",
      email: "test@example.com",
    }));
    expect(mockPush).toHaveBeenCalledWith("/");
  });

  it("muestra error si login falla", async () => {
    (fetch as any).mockResolvedValue({
      ok: false,
      json: async () => ({ message: "Credenciales incorrectas" }),
    });

    render(<LoginForm />);
    fireEvent.submit(screen.getByRole("button", { name: /Iniciar Sesión/i }));

    await waitFor(() => {
      expect(screen.getByText("Credenciales incorrectas")).toBeInTheDocument();
    });
    expect(mockSetUser).not.toHaveBeenCalled();
  });

  it("muestra error de red si fetch lanza excepción", async () => {
    (fetch as any).mockRejectedValue(new Error("Network Error"));

    render(<LoginForm />);
    fireEvent.submit(screen.getByRole("button", { name: /Iniciar Sesión/i }));

    await waitFor(() => {
      expect(screen.getByText("Error del servidor")).toBeInTheDocument();
    });
    expect(mockSetUser).not.toHaveBeenCalled();
  });
});
