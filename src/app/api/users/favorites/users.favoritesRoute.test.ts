import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET, POST } from "@/app/api/users/favorites/route";
import { NextRequest } from "next/server";
import User from "@/models/user";
import { requireAuth } from "@/lib/authMiddleware";

// Mockeos
vi.mock("@/lib/mongodb", () => ({ connectToDatabase: vi.fn() }));
vi.mock("@/models/user");
vi.mock("@/lib/authMiddleware");

describe("Favorites API", () => {
  const mockUser = { id: "user123", _id: "user123", email: "test@test.com", favorites: ["book1"], save: vi.fn() };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("GET devuelve 401 si no está autenticado", async () => {
    (requireAuth as any).mockImplementation(() => { throw new Error("No auth"); });
    const req = {} as NextRequest;

    const res = await GET(req);
    const json = await res.json();
    expect(res.status).toBe(401);
    expect(json.favorites).toEqual([]);
    expect(json.user).toBeNull();
  });

  it("GET devuelve favoritos correctamente", async () => {
    (requireAuth as any).mockReturnValue({ id: "user123", email: "test@test.com" });
    (User.findById as any).mockResolvedValue(mockUser);
    const req = {} as NextRequest;

    const res = await GET(req);
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.user).toEqual({ id: mockUser._id, email: "test@test.com" });
    expect(json.favorites).toEqual(mockUser.favorites);
  });

  it("POST agrega libro a favoritos si no existía", async () => {
    (requireAuth as any).mockReturnValue({ id: "user123", email: "test@test.com" });
    const dbUser = { ...mockUser, favorites: [], save: vi.fn() };
    (User.findById as any).mockResolvedValue(dbUser);

    const req = {
      json: async () => ({ bookId: "book2" }),
    } as unknown as NextRequest;

    const res = await POST(req);
    const json = await res.json();

    expect(dbUser.favorites).toContain("book2");
    expect(dbUser.save).toHaveBeenCalled();
    expect(json.favorites).toContain("book2");
  });

  it("POST quita libro de favoritos si ya existía", async () => {
    (requireAuth as any).mockReturnValue({ id: "user123", email: "test@test.com" });
    const dbUser = { ...mockUser, favorites: ["book1"], save: vi.fn() };
    (User.findById as any).mockResolvedValue(dbUser);

    const req = {
      json: async () => ({ bookId: "book1" }),
    } as unknown as NextRequest;

    const res = await POST(req);
    const json = await res.json();

    expect(dbUser.favorites).not.toContain("book1");
    expect(dbUser.save).toHaveBeenCalled();
    expect(json.favorites).not.toContain("book1");
  });

  it("POST devuelve 400 si no hay bookId", async () => {
    (requireAuth as any).mockReturnValue({ id: "user123" });
    const req = { json: async () => ({}) } as unknown as NextRequest;

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.error).toBe("bookId es requerido");
  });

  it("POST devuelve 401 si no está autenticado", async () => {
    (requireAuth as any).mockImplementation(() => { throw new Error("No auth"); });
    const req = { json: async () => ({ bookId: "book1" }) } as unknown as NextRequest;

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(401);
    expect(json.error).toBe("Unauthorized");
  });
});
