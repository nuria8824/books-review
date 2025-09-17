"use client";

import { useEffect, useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { StarRating } from "@/components/ui/StarRating";

interface UserData {
  id: string;
  email: string;
}

interface Review {
  _id: string;
  bookId: string;
  bookTitle?: string;
  bookThumbnail?: string;
  stars: number;
  text: string;
  votes: number;
  createdAt: number;
}

export default function PerfilPage() {
  const [user, setUser] = useState<UserData | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserAndReviews = async () => {
      try {
        // Obtener usuario actual
        const resUser = await fetch("/api/auth/me", { credentials: "include" });
        if (!resUser.ok) throw new Error("No autenticado");
        const dataUser = await resUser.json();
        setUser(dataUser.user);

        // Obtener reseñas del usuario
        const resReviews = await fetch(`/api/users/${dataUser.user.id}/reviews`);
        if (resReviews.ok) {
          const dataReviews = await resReviews.json();
          setReviews(dataReviews.reviews || []);
        }
      } catch (err) {
        console.error(err);
        setUser(null);
        setReviews([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndReviews();
  }, []);

  const avg = useMemo(
    () => (reviews.length ? reviews.reduce((a, b) => a + b.stars, 0) / reviews.length : 0),
    [reviews]
  );

  if (loading) {
    return <p className="text-center mt-10">Cargando perfil...</p>;
  }

  if (!user) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white rounded-2xl p-6 shadow-xl text-center w-80">
          <h2 className="text-xl font-bold mb-4">
            Necesitas una cuenta para ver tu perfil
          </h2>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto mt-10 bg-white shadow-md rounded-lg p-6 space-y-6">
      <h1 className="text-3xl font-bold mb-4">Perfil de Usuario</h1>
      <p><span className="font-semibold">ID:</span> {user.id}</p>
      <p><span className="font-semibold">Email:</span> {user.email}</p>
      <div className="flex items-center gap-2">
        <span className="font-semibold">Promedio de calificaciones:</span>
        <StarRating value={Math.round(avg) as 1|2|3|4|5} />
        <span className="text-sm text-gray-600">{avg.toFixed(1)} ({reviews.length} reseñas)</span>
      </div>

      <button
        onClick={async () => {
          await fetch("/api/auth/logout", {
            method: "POST",
            credentials: "include"
          });
          window.location.href = "/";
        }}
        className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 cursor-pointer"
      >
        Cerrar sesión
      </button>

      {/* Historial de reseñas */}
      <div className="space-y-3">
        <h2 className="text-2xl font-semibold mt-6">Tus reseñas</h2>
        {reviews.length === 0 ? (
          <p className="text-sm text-gray-600">No has escrito reseñas todavía.</p>
        ) : (
          reviews.map((r) => (
            <Card key={r._id} className="flex flex-col md:flex-row gap-4 p-4">
              {/* Imagen del libro */}
              {r.bookThumbnail && (
                <img
                  src={r.bookThumbnail}
                  alt={r.bookTitle}
                  className="w-24 h-36 object-cover rounded-md self-center md:self-start"
                />
              )}

              {/* Contenido de la reseña */}
              <CardContent className="flex-1 flex flex-col justify-between">
                {/* Título del libro */}
                {r.bookTitle && (
                  <h3 className="text-lg font-semibold mb-1">{r.bookTitle}</h3>
                )}

                {/* Calificación y fecha */}
                <div className="flex items-center justify-between mb-2">
                  <StarRating value={r.stars} />
                  <span className="text-xs text-gray-500">
                    {new Date(r.createdAt).toLocaleDateString()}
                  </span>
                </div>

                {/* Texto de la reseña */}
                <p className="text-sm text-gray-700 mb-2">{r.text}</p>

                {/* Puntos */}
                <span className="text-xs text-gray-500">Puntos: {r.votes}</span>
              </CardContent>
            </Card>
          ))
        )}
      </div>

    </div>
  );
}
