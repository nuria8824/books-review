export async function searchBooks(q: string) {
  const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(q)}&maxResults=18`;
  const res = await fetch(url, { next: { revalidate: 60 } });
  if (!res.ok) throw new Error("Error en la búsqueda");
  const json = await res.json();
  return json.items || [];
}

export async function getBook(id: string) {
  const url = `https://www.googleapis.com/books/v1/volumes/${id}`;
  const res = await fetch(url, { next: { revalidate: 300 } });
  if (!res.ok) throw new Error("No se encontró el libro");
  return res.json();
}