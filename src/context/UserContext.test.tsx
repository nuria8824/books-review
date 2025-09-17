// src/context/UserContext.test.tsx
import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { UserProvider, useUser } from "./UserContext";
import { ReactNode } from "react";

// Helper para envolver hooks con el Provider
const wrapper = ({ children }: { children: ReactNode }) => (
  <UserProvider>{children}</UserProvider>
);

describe("UserContext", () => {
  it("devuelve null como usuario inicial", () => {
    const { result } = renderHook(() => useUser(), { wrapper });
    expect(result.current.user).toBeNull();
  });

  it("permite actualizar el usuario con setUser", () => {
    const { result } = renderHook(() => useUser(), { wrapper });

    act(() => {
      result.current.setUser({ id: "123", email: "test@example.com" });
    });

    expect(result.current.user).toEqual({
      id: "123",
      email: "test@example.com",
    });
  });

  it("puede resetear el usuario a null", () => {
    const { result } = renderHook(() => useUser(), { wrapper });

    act(() => {
      result.current.setUser({ id: "123", email: "test@example.com" });
      result.current.setUser(null);
    });

    expect(result.current.user).toBeNull();
  });

  it("lanza error si se usa fuera del UserProvider", () => {
    expect(() => renderHook(() => useUser())).toThrow(
      "useUser must be used within UserProvider"
    );
  });
});
