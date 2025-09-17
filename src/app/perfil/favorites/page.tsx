"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";

interface Book {
  id: string;
  title: string;
  thumbnail: string;
}

export default function PerfilFavorites({ userId }: { userId: string }) {
  const [favorites, setFavorites] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const res = await fetch(`/api/users/${userId}/favorites`);
        if (!res.ok) throw new Error("Error al obtener favoritos");
        const data = await res.json();

        // data.favorites = [bookId, bookId, ...]
        const books: Book[] = await Promise.all(
          data.favorites.map(async (bookId: string) => {
            const resBook = await fetch(
              `https://www.googleapis.com/books/v1/volumes/${bookId}`
            );
            if (!resBook.ok) return null;
            const bookData = await resBook.json();
            return {
              id: bookData.id,
              title: bookData.volumeInfo?.title || "Título desconocido",
              thumbnail:
                bookData.volumeInfo?.imageLinks?.thumbnail ||
                "/placeholder-book.png",
            };
          })
        );

        setFavorites(books.filter(Boolean) as Book[]);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [userId]);

  if (loading) {
    return <p className="text-center mt-4">Cargando favoritos...</p>;
  }

  if (favorites.length === 0) {
    return <p className="text-sm text-gray-600">No tienes libros favoritos.</p>;
  }

  return (
    <div className="space-y-3">
      <h2 className="text-2xl font-semibold mt-6">Tus favoritos</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {favorites.map((book) => (
          <Card key={book.id}>
            <CardContent className="p-3">
              <img
                src={book.thumbnail}
                alt={book.title}
                className="w-full h-40 object-cover rounded"
              />
              <p className="mt-2 text-sm font-semibold line-clamp-2">
                {book.title}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
