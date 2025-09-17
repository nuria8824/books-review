"use server";

import { redirect } from "next/navigation";

export async function search(formData: FormData) {
  const q = formData.get("q") as string;
  if (q && q.trim()) {
    redirect(`/search?q=${encodeURIComponent(q.trim())}`);
  }
}
