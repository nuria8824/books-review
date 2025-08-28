"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useFormStatus } from "react-dom";
import { search } from "@/actions";

export function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending}>
      Buscar
    </Button>
  );
}

export function SearchForm({ initialQuery }: { initialQuery?: string }) {
  return (
    <form action={search} className="flex gap-2">
      <Input
        name="q"
        defaultValue={initialQuery || ""}
        placeholder="Título, autor o ISBN…"
      />
      <SubmitButton />
    </form>
  );
}