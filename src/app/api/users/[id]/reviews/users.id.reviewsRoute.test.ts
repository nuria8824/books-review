import { vi, describe, it, expect, beforeEach } from "vitest";
import { GET } from "@/app/api/users/[id]/reviews/route";
import User from "@/models/user";
import Review from "@/models/review";
import mongoose from "mongoose";

vi.mock("@/models/user");
vi.mock("@/models/review");
vi.mock("@/lib/mongodb", () => ({ connectToDatabase: vi.fn() }));

describe("GET /api/users/[id]/reviews", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("devuelve error 400 si el id es inválido", async () => {
    const req = {} as any;
    const res = await GET(req, { params: Promise.resolve({ id: "123" }) });
    const json = await res.json();
    expect(res.status).toBe(400);
    expect(json.error).toBe("ID inválido");
  });

  it("devuelve error 404 si el usuario no existe", async () => {
    (User.findById as any).mockResolvedValue(null);
    const req = {} as any;
    const validId = new mongoose.Types.ObjectId().toString();
    const res = await GET(req, { params: Promise.resolve({ id: validId }) });
    const json = await res.json();
    expect(res.status).toBe(404);
    expect(json.error).toBe("Usuario no encontrado");
  });

  it("devuelve usuario y reseñas si todo está ok", async () => {
    const validId = new mongoose.Types.ObjectId().toString();
    const mockUser = { _id: validId, email: "test@test.com", name: "Test User" };
    const mockReviews = [
      { _id: "r1", text: "Excelente", stars: 5, user: mockUser },
      { _id: "r2", text: "Bueno", stars: 4, user: mockUser },
    ];

    (User.findById as any).mockResolvedValue(mockUser);

    const mockPopulate = vi.fn().mockResolvedValue(mockReviews);
    (Review.find as any).mockReturnValue({ populate: () => ({ sort: mockPopulate }) });

    const req = {} as any;
    const res = await GET(req, { params: Promise.resolve({ id: validId }) });
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.user).toEqual(mockUser);
    expect(json.reviews).toEqual(mockReviews);
  });
});
