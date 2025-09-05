import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { setupTestDB, teardownTestDB } from "../test/setup";
import { hashPassword, verifyPassword, signToken, verifyToken } from "@/lib/auth";

beforeAll(async () => { await setupTestDB(); });
afterAll(async () => { await teardownTestDB(); });

describe("auth lib", () => {
  it("hash y verify funcionan", async () => {
    const hash = await hashPassword("secret");
    expect(await verifyPassword(hash, "secret")).toBe(true);
  });

  it("token sign/verify", () => {
    const t = signToken({ id: "123" });
    const payload = verifyToken(t) as any;
    expect(payload.id).toBe("123");
  });
});
