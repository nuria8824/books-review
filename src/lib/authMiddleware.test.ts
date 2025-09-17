import { describe, it, expect, vi, beforeEach } from "vitest";
import * as authMiddleware from "@/lib/authMiddleware";
import * as jwt from "jsonwebtoken";

// Mock de jwt
vi.mock("jsonwebtoken", () => ({
  verify: vi.fn(),
}));

describe("authMiddleware", () => {
  const mockPayload: authMiddleware.AuthPayload = { id: "123", email: "test@example.com" };
  let req: any;

  beforeEach(() => {
    // Simular objeto NextRequest con cookies
    req = {
      cookies: new Map<string, { value: string }>(),
    };
    req.cookies.get = (name: string) =>
      req.cookies.has(name) ? { value: req.cookies.get(name)!.value } : undefined;

    vi.clearAllMocks();
  });

  describe("getUserFromToken", () => {
    it("retorna null si no hay token", () => {
      const result = authMiddleware.getUserFromToken(req);
      expect(result).toBeNull();
    });
  });

  describe("requireAuth", () => {
    it("lanza error si no hay token", () => {
      expect(() => authMiddleware.requireAuth(req)).toThrow("Unauthorized");
    });
  });
});
