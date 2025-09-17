"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "./button";
import { Input } from "./input";
import { Card, CardContent } from "./card";
import { StarRating } from "./StarRating";

interface Review {
  _id: string;
  bookId: string;
  user: { _id: string; email: string };
  stars: number;
  text: string;
  votes: number;
  createdAt: number;
}

interface User {
  id: string;
  email: string;
}

export default function ReviewSection({ bookId }: { bookId: string }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stars, setStars] = useState<1 | 2 | 3 | 4 | 5>(5);
  const [text, setText] = useState("");
  const [user, setUser] = useState<User | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [editStars, setEditStars] = useState<1 | 2 | 3 | 4 | 5>(5);
  const starOptions: (1 | 2 | 3 | 4 | 5)[] = [1, 2, 3, 4, 5];

  // Obtener usuario autenticado
  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setUser(data?.user || null))
      .catch(() => setUser(null));
  }, []);

  // Obtener reseñas
  const fetchReviews = async () => {
    const res = await fetch(`/api/reviews?bookId=${bookId}`);
    if (res.ok) {
      const data = await res.json();
      setReviews(data.reviews || []);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [bookId]);

  // Crear reseña
  const handleSubmit = async () => {
    if (!text.trim() || !user) return;

    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookId, content: text, rating: stars }),
      credentials: "include",
    });

    if (res.ok) {
      setText("");
      setStars(5);
      fetchReviews();
    } else {
      const data = await res.json();
      alert(data.error || "Error al crear reseña");
    }
  };

  // Votar reseña
  const vote = async (reviewId: string, delta: 1 | -1) => {
    if (!user) return;

    const res = await fetch("/api/reviews/vote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reviewId, delta }),
      credentials: "include",
    });

    if (res.ok) {
      fetchReviews();
    } else {
      const data = await res.json();
      alert(data.error || "Error al votar reseña");
    }
  };

  // Guardar edición
  const saveEdit = async (reviewId: string) => {
    const res = await fetch(`/api/reviews/${reviewId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: editText, stars: editStars }),
      credentials: "include",
    });

    if (res.ok) {
      setEditingId(null);
      fetchReviews();
    } else {
      const data = await res.json();
      alert(data.error || "Error al editar reseña");
    }
  };

  // Cancelar edición
  const cancelEdit = () => {
    setEditingId(null);
    setEditText("");
    setEditStars(5);
  };

  // Eliminar reseña
  const handleDelete = async (id: string) => {
    if (!confirm("¿Seguro que quieres eliminar esta reseña?")) return;

    const res = await fetch(`/api/reviews/${id}`, {
      method: "DELETE",
      credentials: "include",
    });

    if (res.ok) {
      fetchReviews();
    } else {
      const data = await res.json();
      alert(data.error || "Error al eliminar reseña");
    }
  };

  const avg = useMemo(
    () => (reviews.length ? reviews.reduce((a, b) => a + b.stars, 0) / reviews.length : 0),
    [reviews]
  );

  return (
    <div className="space-y-6">
      {/* Formulario */}
      <div className="rounded-2xl border p-4">
        <h3 className="text-lg font-semibold mb-2">Escribir reseña</h3>
        {user ? (
          <>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-sm">Tu calificación:</span>
              <StarRating value={stars} onChange={setStars} />
              <span className="text-sm text-[#2c2c2c]">{stars}/5</span>
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="¿Qué te pareció el libro?"
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
              <Button onClick={handleSubmit}>Publicar</Button>
            </div>
          </>
        ) : (
          <p className="text-sm text-red-600">
            Inicia sesión para ver y dejar una reseña
          </p>
        )}
      </div>

      {/* Promedio */}
      <div className="flex items-center gap-3">
        <span className="font-medium">Promedio comunidad:</span>
        <StarRating value={Math.round(avg) as 1 | 2 | 3 | 4 | 5} />
        <span className="text-sm text-[#2c2c2c]">
          {avg ? avg.toFixed(1) : "—"} ({reviews.length} reseñas)
        </span>
      </div>

      {/* Lista */}
      <div className="space-y-3">
        {reviews.length === 0 ? (
          <p className="text-sm text-[#2c2c2c]">Sé la primera persona en opinar.</p>
        ) : (
          reviews
            .sort((a, b) => b.votes - a.votes || b.createdAt - a.createdAt)
            .map((r) => (
              <Card key={r._id}>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <StarRating value={r.stars} />
                    <span className="text-xs text-[#2c2c2c]">
                      {new Date(r.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 py-2">
                    Publicado por: <span className="font-medium text-gray-700">{r.user.email}</span>
                  </p>

                  {/* Edición en línea */}
                  {editingId === r._id ? (
                    <div className="space-y-2">
                      <textarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="w-full p-2 border rounded-md"
                        aria-label="Editar reseña"
                      />
                      <div className="flex gap-1">
                        <span className="text-sm text-gray-700">Tu calificación:</span>
                        <StarRating
                          value={editStars}
                          onChange={(v) => setEditStars(v)}
                          size={22}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="destructive"
                          className="cursor-pointer"
                          onClick={() => saveEdit(r._id)}
                        >
                          Guardar
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          className="cursor-pointer"
                          onClick={cancelEdit}
                        >
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="mt-2">{r.text}</p>
                      <div className="mt-3 flex justify-between items-center">
                        {/* Izquierda: votos y puntaje */}
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="secondary"
                            className="cursor-pointer"
                            onClick={() => vote(r._id, 1)}
                          >
                            👍
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            className="cursor-pointer"
                            onClick={() => vote(r._id, -1)}
                          >
                            👎
                          </Button>
                          <span className="text-sm text-[#2c2c2c]">Puntaje: {r.votes}</span>
                        </div>

                        {/* Derecha: editar/eliminar */}
                        {user?.id === r.user._id && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              className="bg-blue-400 hover:bg-blue-500 text-white"
                              onClick={() => {
                                setEditingId(r._id);
                                setEditText(r.text);
                                if ([1, 2, 3, 4, 5].includes(r.stars)) {
                                  setEditStars(r.stars as 1 | 2 | 3 | 4 | 5);
                                }
                                else {
                                  setEditStars(5);
                                }
                              }}
                            >
                              Editar
                            </Button>
                            <Button
                              size="sm"
                              className="bg-red-500 hover:bg-red-600 text-white"
                              onClick={() => handleDelete(r._id)}
                            >
                              Eliminar
                            </Button>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            ))
        )}
      </div>
    </div>
  );
}
