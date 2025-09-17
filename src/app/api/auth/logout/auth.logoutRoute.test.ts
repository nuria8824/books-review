import { describe, it, expect } from "vitest";
import { POST } from "@/app/api/auth/logout/route";

describe("/api/auth/logout POST", () => {
  it("resetea la cookie br_auth y devuelve mensaje", async () => {
    const res = await POST();

    const data = await res.json();
    expect(data.message).toBe("Sesión cerrada correctamente");

    const cookie = res.cookies.get("br_auth");
    expect(cookie).toBeDefined();
    expect(cookie?.value).toBe("");

    // Verificamos que expires sea una fecha en el pasado
    if (cookie?.expires instanceof Date) {
      expect(cookie.expires.getTime()).toBe(0);
    } else if (typeof cookie?.expires === "number") {
      expect(cookie.expires).toBe(0);
    } else {
      throw new Error("expires no está definido en la cookie");
    }
  });
});
