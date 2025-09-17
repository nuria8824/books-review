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

import { search } from "@/actions";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

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
});
