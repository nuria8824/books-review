"use client";
import { useState } from "react";

export function StarRating({
  value,
  onChange,
  size = 22,
}: { value?: number; onChange?: (v: 1|2|3|4|5) => void; size?: number }) {
  const [hover, setHover] = useState<number | null>(null);
  const curr = hover ?? value ?? 0;

  return (
    <div className="flex items-center gap-1">
      {[1,2,3,4,5].map((n) => (
        <button
          key={n}
          type="button"
          aria-label={`${n} estrellas`}
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(null)}
          onClick={() => onChange?.(n as 1|2|3|4|5)}
        >
          <svg viewBox="0 0 24 24" width={size} height={size}
               className={n <= curr ? "fill-yellow-400" : "fill-[#f0f4f7] stroke-[#a0a0a0]"}>
            <path d="M12 .6 15.7 8l8.2 1.2-5.9 5.8 1.4 8.2L12 18.9 4.7 23.2l1.4-8.2L.1 9.2 8.3 8 12 .6z"/>
          </svg>
        </button>
      ))}
    </div>
  );
}