"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface UserData {
  id: string;
  email: string;
}

interface BookInfo {
  id: string;
  title: string;
  thumbnail: string;
}

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<BookInfo[]>([]);
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const res = await fetch("/api/users/favorites", { credentials: "include" });
        if (!res.ok) throw new Error("No autorizado");
        const data = await res.json();
        setUser(data.user);

        // Si hay favoritos, obtenemos los datos de Google Books
        if (data.favorites.length > 0) {
          const books = await Promise.all(
            data.favorites.map(async (id: string) => {
              const resBook = await fetch(`https://www.googleapis.com/books/v1/volumes/${id}`);
              if (!resBook.ok) return null;
              const json = await resBook.json();
              const v = json.volumeInfo ?? {};
              const rawImg = v.imageLinks?.thumbnail || "";
              const thumbnail = rawImg.replace(/^http:\/\//, "https://");
              return { id, title: v.title || "Sin título", thumbnail };
            })
          );

          setFavorites(books.filter(Boolean) as BookInfo[]);
        }
      } catch (err) {
        console.error(err);
        setUser(null);
        setFavorites([]);
      } finally {
        setLoading(false);
      }
    };
    fetchFavorites();
  }, []);

  if (loading) return <p className="text-center mt-10">Cargando favoritos...</p>;
  if (!user) return <p className="text-center mt-10">Necesitas estar logueado.</p>;

  return (
    <div className="max-w-3xl mx-auto mt-10 space-y-6">
      <h1 className="text-3xl font-bold mb-4">Tus libros favoritos</h1>
      {favorites.length === 0 ? (
        <p className="text-gray-600">No has agregado libros a favoritos todavía.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {favorites.map((book) => (
            <Link
              key={book.id}
              href={`/book/${book.id}`}
              className="flex flex-col items-center p-4 bg-[#b3cdd1] rounded-lg shadow hover:shadow-md transition"
            >
              {book.thumbnail && (
                <img
                  src={book.thumbnail}
                  alt={book.title}
                  className="w-32 h-48 object-cover rounded-md mb-2"
                />
              )}
              <span className="text-center font-medium">{book.title}</span>
            </Link>
          ))}
        </div>
      )}

      <Link href="/perfil" className="mt-4 px-4 py-2 bg-gray-200 rounded-lg inline-block">
        Volver al perfil
      </Link>
    </div>
  );
}
