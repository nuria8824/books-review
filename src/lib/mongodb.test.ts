import { describe, it, expect, vi, beforeEach } from "vitest";
import mongoose from "mongoose";

// Importamos después de mockear process.env
vi.mock("mongoose");

describe("connectToDatabase", () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    vi.resetModules();
    originalEnv = process.env;
    process.env = { ...originalEnv, MONGODB_URI: "mongodb://localhost:27017/test" };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("debe lanzar error si MONGODB_URI no está definido", async () => {
    process.env.MONGODB_URI = "";
    await expect(async () => {
      await import("@/lib/mongodb").then((mod) => mod.connectToDatabase());
    }).rejects.toThrow("Please define the MONGODB_URI");
  });

  it("debe conectarse a la base de datos y retornar la conexión", async () => {
    const mockConn = { connection: "mock" };
    (mongoose.connect as any).mockResolvedValue(mockConn);

    const { connectToDatabase } = await import("@/lib/mongodb");
    const conn = await connectToDatabase();
    expect(conn).toBe(mockConn);
    expect(mongoose.connect).toHaveBeenCalledWith(process.env.MONGODB_URI, {
      dbName: "books-review",
      bufferCommands: false,
    });
  });
});
