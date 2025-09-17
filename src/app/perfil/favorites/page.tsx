// "use client";

// import { useEffect, useState } from "react";
// import { Card, CardContent } from "@/components/ui/card";

// interface Book {
//   id: string;
//   title: string;
//   thumbnail: string;
// }

// export default function PerfilFavorites({ userId }: { userId: string }) {
//   const [favorites, setFavorites] = useState<Book[]>([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchFavorites = async () => {
//       try {
//         const res = await fetch(`/api/users/${userId}/favorites`, { credentials: "include"});
//         if (!res.ok) throw new Error("Error al obtener favoritos");
//         const data = await res.json();

//         // data.favorites = [bookId, bookId, ...]
//         const books: Book[] = await Promise.all(
//           data.favorites.map(async (bookId: string) => {
//             const resBook = await fetch(
//               `https://www.googleapis.com/books/v1/volumes/${bookId}`
//             );
//             if (!resBook.ok) return null;
//             const bookData = await resBook.json();
//             return {
//               id: bookData.id,
//               title: bookData.volumeInfo?.title || "Título desconocido",
//               thumbnail:
//                 bookData.volumeInfo?.imageLinks?.thumbnail ||
//                 "/placeholder-book.png",
//             };
//           })
//         );

//         setFavorites(books.filter(Boolean) as Book[]);
//       } catch (err) {
//         console.error(err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchFavorites();
//   }, [userId]);

//   if (loading) {
//     return <p className="text-center mt-4">Cargando favoritos...</p>;
//   }

//   if (favorites.length === 0) {
//     return <p className="text-sm text-gray-600">No tienes libros favoritos.</p>;
//   }

//   return (
//     <div className="space-y-3">
//       <h2 className="text-2xl font-semibold mt-6">Tus favoritos</h2>
//       <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
//         {favorites.map((book) => (
//           <Card key={book.id}>
//             <CardContent className="p-3">
//               <img
//                 src={book.thumbnail}
//                 alt={book.title}
//                 className="w-full h-40 object-cover rounded"
//               />
//               <p className="mt-2 text-sm font-semibold line-clamp-2">
//                 {book.title}
//               </p>
//             </CardContent>
//           </Card>
//         ))}
//       </div>
//     </div>
//   );
// }

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface UserData {
  id: string;
  email: string;
}

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const res = await fetch("/api/users/favorites", { credentials: "include" });
        if (!res.ok) throw new Error("No autorizado");
        const data = await res.json();
        setUser(data.user);
        setFavorites(data.favorites);
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
    <div className="max-w-2xl mx-auto mt-10 bg-white shadow-md rounded-lg p-6 space-y-6">
      <h1 className="text-3xl font-bold mb-4">Tus libros favoritos</h1>
      {favorites.length === 0 ? (
        <p className="text-gray-600">No has agregado libros a favoritos todavía.</p>
      ) : (
        <ul className="space-y-2">
          {favorites.map((bookId) => (
            <li key={bookId}>
              {/* Aquí puedes mostrar el título usando Google Books API si quieres */}
              <span className="text-blue-600">{bookId}</span>
            </li>
          ))}
        </ul>
      )}

      <Link href="/perfil" className="mt-4 px-4 py-2 bg-gray-200 rounded-lg inline-block">
        Volver al perfil
      </Link>
    </div>
  );
}
