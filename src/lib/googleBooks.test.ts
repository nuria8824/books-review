// googleBooks.test.ts
import { vi, describe, it, expect, beforeEach } from "vitest";
import { searchBooks, getBook } from "./googleBooks";

describe("googleBooks API functions", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("searchBooks debería devolver items cuando la respuesta es exitosa", async () => {
    const mockJson = { items: [{ id: "1", volumeInfo: { title: "Libro de prueba" } }] };

    vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => mockJson,
    } as any);

    const result = await searchBooks("prueba");

    expect(fetch).toHaveBeenCalledWith(
      "https://www.googleapis.com/books/v1/volumes?q=prueba&maxResults=18",
      { next: { revalidate: 60 } }
    );
    expect(result).toEqual(mockJson.items);
  });

  it("searchBooks debería devolver [] si no hay items", async () => {
    const mockJson = {};

    vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => mockJson,
    } as any);

    const result = await searchBooks("sin resultados");
    expect(result).toEqual([]);
  });

  it("searchBooks debería lanzar error si la respuesta no es ok", async () => {
    vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: false,
    } as any);

    await expect(searchBooks("fallo")).rejects.toThrow("Error en la búsqueda");
  });

  it("getBook debería devolver json cuando la respuesta es exitosa", async () => {
    const mockJson = { id: "abc", volumeInfo: { title: "Otro libro" } };

    vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => mockJson,
    } as any);

    const result = await getBook("abc");

    expect(fetch).toHaveBeenCalledWith(
      "https://www.googleapis.com/books/v1/volumes/abc",
      { next: { revalidate: 300 } }
    );
    expect(result).toEqual(mockJson);
  });

  it("getBook debería lanzar error si no encuentra el libro", async () => {
    vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: false,
    } as any);

    await expect(getBook("404")).rejects.toThrow("No se encontró el libro");
  });
});
