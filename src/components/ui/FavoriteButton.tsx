"use client";

import { useEffect, useState } from "react";

interface FavoriteButtonProps {
  bookId: string;
  userLoggedIn: boolean;
}

export default function FavoriteButton({ bookId, userLoggedIn }: FavoriteButtonProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userLoggedIn) return; // No hacer fetch si no está logueado

    const fetchFavorites = async () => {
      try {
        const res = await fetch("/api/users/favorites", { credentials: "include" });
        if (!res.ok) throw new Error("No autorizado");
        const data = await res.json();
        setIsFavorite(data.favorites.includes(bookId));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchFavorites();
  }, [bookId, userLoggedIn]);

  const toggleFavorite = async () => {
    if (!userLoggedIn) return; // No permitir acción si no hay usuario
    setLoading(true);
    try {
      const res = await fetch("/api/users/favorites", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookId }),
      });
      if (!res.ok) throw new Error("Error al actualizar favoritos");
      const data = await res.json();
      setIsFavorite(data.favorites.includes(bookId));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!userLoggedIn) return null; // No mostrar botón si no hay usuario

  return (
    <button
      onClick={toggleFavorite}
      disabled={loading}
      className={`px-4 py-2 rounded-lg ${
        isFavorite ? "bg-red-500 text-white" : "bg-gray-200 text-gray-800"
      } hover:opacity-80`}
    >
      {isFavorite ? "💔 Quitar de favoritos" : "❤️ Agregar a favoritos"}
    </button>
  );
}
