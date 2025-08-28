"use client";

import { useEffect, useMemo, useState } from "react";
import { v4 as uuid } from "uuid";
import { Button } from "./button";
import { Input } from "./input";
import { Card, CardContent } from "./card";
import { StarRating } from "./StarRating";
import { addReview, getReviews, voteReview } from "../../lib/storage";
import type { Review } from "../../lib/types";

export default function ReviewSection({ bookId }: { bookId: string }) {
  const [list, setList] = useState<Review[]>([]);
  const [stars, setStars] = useState<1|2|3|4|5>(5);
  const [text, setText] = useState("");

  useEffect(() => setList(getReviews(bookId)), [bookId]);

  function submit() {
    if (!text.trim()) return;
    const r: Review = {
      id: uuid(),
      bookId, stars,
      text: text.trim(),
      votes: 0,
      createdAt: Date.now(),
    };
    addReview(r);
    setList(prev => [r, ...prev]);
    setText("");
    setStars(5);
  }

  function vote(id: string, delta: 1|-1) {
    voteReview(bookId, id, delta);
    setList(getReviews(bookId));
  }

  const avg = useMemo(
    () => (list.length ? list.reduce((a,b)=>a+b.stars,0)/list.length : 0),
    [list]
  );

  return (
    <div className="space-y-6">
      {/* Formulario */}
      <div className="rounded-2xl border p-4">
        <h3 className="text-lg font-semibold mb-2">Escribir reseña</h3>
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
          <Button onClick={submit}>Publicar</Button>
        </div>
      </div>

      {/* Promedio */}
      <div className="flex items-center gap-3">
        <span className="font-medium">Promedio comunidad:</span>
        <StarRating value={Math.round(avg) as 1|2|3|4|5} />
        <span className="text-sm text-[#2c2c2c]">
          {avg ? avg.toFixed(1) : "—"} ({list.length} reseñas)
        </span>
      </div>

      {/* Lista */}
      <div className="space-y-3">
        {list.length === 0 ? (
          <p className="text-sm text-[#2c2c2c]">Sé la primera persona en opinar.</p>
        ) : (
          list
            .sort((a,b) => b.votes - a.votes || b.createdAt - a.createdAt)
            .map(r => (
              <Card key={r.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <StarRating value={r.stars} />
                    <span className="text-xs text-[#2c2c2c]">
                      {new Date(r.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="mt-2">{r.text}</p>
                  <div className="mt-3 flex items-center gap-2">
                    <Button size="sm" variant="secondary" onClick={() => vote(r.id, 1)}>👍</Button>
                    <Button size="sm" variant="secondary" onClick={() => vote(r.id, -1)}>👎</Button>
                    <span className="text-sm text-[#2c2c2c]">Puntaje: {r.votes}</span>
                  </div>
                </CardContent>
              </Card>
            ))
        )}
      </div>
    </div>
  );
}